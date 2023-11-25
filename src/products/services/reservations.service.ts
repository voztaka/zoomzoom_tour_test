import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { Reservations } from '../entities/reservations.entity';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { TourProductsService } from './tour-products.service';
import { ReservationResponseDto } from '../dto/reservation-response.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservations)
    private reservationsRepository: Repository<Reservations>,
    private tourProductsService: TourProductsService,
  ) {}

  async createReservation(
    dto: CreateReservationDto,
    customerId: number,
  ): Promise<ReservationResponseDto> {
    const tourProduct = await this.tourProductsService.findOneById(
      dto.tourProductId,
    );

    if (!tourProduct) {
      throw new HttpException(
        '투어 상품을 찾을 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const reservedCount = await this.reservationsRepository.count({
      where: {
        customer: { id: customerId },
        tourProduct: { id: dto.tourProductId },
        date: dto.date,
        status: In(['Approved']),
      },
    });

    // 예약 상태 결정
    const status =
      reservedCount >= tourProduct.capacity ? 'Pending' : 'Approved';

    // 유니크 토큰 생성
    const token = this.generateUniqueToken();

    const reservation = this.reservationsRepository.create({
      customer: { id: customerId },
      tourProduct: { id: dto.tourProductId },
      date: dto.date,
      token,
      status,
    });

    await this.reservationsRepository.save(reservation);

    return {
      token,
      date: dto.date,
      status,
    };
  }

  private generateUniqueToken(): string {
    return uuidv4();
  }

  async checkByToken(token: string, sellerId: number): Promise<Reservations> {
    const reservation = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.tourProduct', 'tourProduct')
      .leftJoinAndSelect('tourProduct.seller', 'seller')
      .where('reservation.token = :token', { token })
      .andWhere('seller.id = :sellerId', { sellerId })
      .getOne();

    if (!reservation) {
      throw new HttpException('없는 예약 정보입니다.', HttpStatus.NOT_FOUND);
    }

    if (reservation.token_used_at) {
      throw new HttpException(
        '이미 사용된 토큰입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.reservationsRepository.update(
      {
        token,
      },
      { token_used_at: new Date() },
    );

    return reservation;
  }

  async cancelReservation(customerId: number, token: string): Promise<void> {
    const reservation = await this.reservationsRepository.findOne({
      where: {
        token,
        customer: { id: customerId },
        status: In(['Approved', 'Pending']),
      },
      relations: ['tourProduct'],
    });

    if (!reservation) {
      throw new HttpException(
        '취소 가능한 투어 상품이 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    // 투어 상품의 local timezone에 맞게 현재 시간 변경
    const currentLocalTime = moment.utc().tz(reservation.tourProduct.timezone);

    // 예약 날짜를 같은 local timezone에 맞게 변경
    const reservationTime = moment
      .tz(
        String(reservation.date),
        'YYYY-MM-DD',
        reservation.tourProduct.timezone,
      )
      .startOf('day');

    const shiftedCurrentLocalTime = currentLocalTime.add(2, 'days');

    if (shiftedCurrentLocalTime.isSameOrAfter(reservationTime)) {
      throw new HttpException(
        '취소는 투어 당일 기준으로, 3일 전에만 가능합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateResult = await this.reservationsRepository.update(
      { token, customer: { id: customerId } },
      { status: 'Cancelled' },
    );

    if (updateResult.affected === 0) {
      throw new HttpException(
        '예약 취소 업데이트 실패',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveReservation(
    reservationId: number,
    sellerId: number,
  ): Promise<void> {
    const reservation = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.tourProduct', 'tourProduct')
      .leftJoinAndSelect('tourProduct.seller', 'seller')
      .where('reservation.id = :reservationId', { reservationId })
      .andWhere('seller.id = :sellerId', { sellerId })
      .getOne();

    if (!reservation) {
      throw new HttpException(
        '승인할 예약 정보가 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (reservation.status !== 'Pending') {
      throw new HttpException(
        '승인 상태의 예약이 아닙니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateResult = await this.reservationsRepository.update(
      { id: reservationId },
      { status: 'Approved' },
    );

    if (updateResult.affected === 0) {
      throw new HttpException(
        '예약 승인 업데이트 실패',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
