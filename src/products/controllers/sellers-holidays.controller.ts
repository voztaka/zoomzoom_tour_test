import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateHolidayDto } from '../dto/create-holiday.dto';
import { HolidaysService } from '../services/holidays.service';
import { SellerAuthorizationGuard } from 'src/common/guards/seller_authorization.guard';
import { UserRequest } from 'src/common/interfaces/user.interface';

@Controller('sellers/holidays')
@UseGuards(SellerAuthorizationGuard)
export class SellersHolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  async createHoliday(
    @Body() createHolidayDto: CreateHolidayDto,
    @Req() req: UserRequest,
  ) {
    const sellerId = Number(req.user.id);
    await this.holidaysService.createHoliday(createHolidayDto, sellerId);
    return { message: '휴일 추가 성공' };
  }
}
