import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Holidays } from '../entities/holidays.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { TourProducts } from '../entities/tour-products.entity';
import { RedisService } from 'src/utils/redis/redis.service';
import { TourProductsService } from './tour-products.service';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holidays)
    private holidaysRepository: Repository<Holidays>,
    private redisService: RedisService,
    private tourProductsService: TourProductsService,
  ) {}

  async createHoliday(
    dto: CreateHolidayDto,
    sellerId: number,
  ): Promise<Holidays> {
    if ((dto.date && dto.dayOfWeek) || (!dto.date && !dto.dayOfWeek)) {
      throw new HttpException(
        'date 또는 dayOfWeek 중 하나만 필수로 입력하여야 합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tourProduct = await this.tourProductsService.findOneByIdAndSellerId(
      dto.tourProductId,
      sellerId,
    );

    if (!tourProduct) {
      throw new HttpException(
        '투어 상품을 찾을 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isRecurring = dto.dayOfWeek != null;

    let existingHoliday: Holidays;
    if (dto.date) {
      existingHoliday = await this.holidaysRepository.findOne({
        where: {
          tourProduct: { id: dto.tourProductId },
          date: dto.date,
        },
      });
    } else if (dto.dayOfWeek) {
      existingHoliday = await this.holidaysRepository.findOne({
        where: {
          tourProduct: { id: dto.tourProductId },
          day_of_week: dto.dayOfWeek,
        },
      });
    }

    if (existingHoliday) {
      throw new HttpException('이미 존재하는 휴일입니다.', HttpStatus.CONFLICT);
    }

    const holiday = this.holidaysRepository.create({
      ...dto,
      day_of_week: dto.dayOfWeek,
      tourProduct: { id: dto.tourProductId } as TourProducts,
      recurring: isRecurring,
    });

    // reset cache
    await this.resetScheduleCache(dto.tourProductId);

    return this.holidaysRepository.save(holiday);
  }

  private async resetScheduleCache(tourProductId: number): Promise<void> {
    const cacheKeyPattern = `schedule:${tourProductId}:*`;
    await this.redisService.clearCache(cacheKeyPattern);
  }
}
