import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ScheduleQueryDto } from '../dto/schedule-query.dto';
import { TourProductsService } from '../services/tour-products.service';
import { CustomerAuthorizationGuard } from 'src/common/guards/customer_authorization.guard';

@Controller('customers/tour_products')
@UseGuards(CustomerAuthorizationGuard)
export class CustomersTourProductsController {
  constructor(private readonly tourProductsService: TourProductsService) {}

  @Get('/schedule')
  async getMonthlySchedule(@Query() scheduleQueryDto: ScheduleQueryDto) {
    return this.tourProductsService.getMonthlySchedule(scheduleQueryDto);
  }
}
