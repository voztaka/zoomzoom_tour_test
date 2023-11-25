import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckReservationDto } from '../dto/check-reservation.dto';
import { ReservationsService } from '../services/reservations.service';
import { SellerAuthorizationGuard } from 'src/common/guards/seller_authorization.guard';
import { UserRequest } from 'src/common/interfaces/user.interface';

@Controller('sellers/reservations')
@UseGuards(SellerAuthorizationGuard)
export class SellersReservationController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('/check')
  checkReservation(
    @Body() checkReservationDto: CheckReservationDto,
    @Req() req: UserRequest,
  ) {
    const sellerId = Number(req.user.id);
    return this.reservationsService.checkByToken(
      checkReservationDto.token,
      sellerId,
    );
  }

  @Patch('/:reservationId/approve')
  async approveBySeller(
    @Param('reservationId') reservationId: number,
    @Req() req: UserRequest,
  ) {
    const sellerId = Number(req.user.id);
    await this.reservationsService.approveReservation(reservationId, sellerId);
    return { message: '예약 승인 성공' };
  }
}
