import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { CustomerAuthorizationGuard } from 'src/common/guards/customer_authorization.guard';
import { UserRequest } from 'src/common/interfaces/user.interface';
import { CancelReservationDto } from '../dto/cancel-reservation.dto';

@Controller('customers/reservations')
@UseGuards(CustomerAuthorizationGuard)
export class CustomersReservationController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async reserveTourProduct(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req: UserRequest,
  ) {
    console.log(createReservationDto);
    const customerId = Number(req.user.id);
    return this.reservationsService.createReservation(
      createReservationDto,
      customerId,
    );
  }

  @Post('/cancel')
  async cancelReservation(
    @Body() cancelReservationDto: CancelReservationDto,
    @Req() req: UserRequest,
  ) {
    const customerId = Number(req.user.id);
    await this.reservationsService.cancelReservation(
      customerId,
      cancelReservationDto.token,
    );
    return { message: '예약 취소 성공' };
  }
}
