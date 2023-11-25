import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { TourProducts } from '../entities/tour-products.entity';
import { ScheduleQueryDto } from '../dto/schedule-query.dto';
import { Holidays } from '../entities/holidays.entity';
import { RedisService } from 'src/utils/redis/redis.service';

@Injectable()
export class TourProductsService {
  constructor(
    @InjectRepository(TourProducts)
    private tourProductsRepository: Repository<TourProducts>,
    private redisService: RedisService,
  ) {}

  async findOneById(id: number): Promise<TourProducts | undefined> {
    return this.tourProductsRepository.findOne({ where: { id } });
  }

  async findOneByIdAndSellerId(
    id: number,
    sellerId: number,
  ): Promise<TourProducts | undefined> {
    return this.tourProductsRepository.findOne({
      where: { id, seller: { id: sellerId } },
    });
  }

  async getMonthlySchedule(dto: ScheduleQueryDto): Promise<any> {
    const cachedSchedule = await this.checkCachedSchedule(
      dto.month,
      dto.year,
      dto.tour_product_id,
    );
    if (cachedSchedule) {
      return cachedSchedule;
    }

    const schedule = await this.fetchScheduleFromDatabase(
      dto.month,
      dto.year,
      dto.tour_product_id,
    );

    await this.cacheSchedule(
      dto.month,
      dto.year,
      dto.tour_product_id,
      schedule,
    );

    return schedule;
  }

  private async checkCachedSchedule(
    month: number,
    year: number,
    tourProductId: number,
  ): Promise<any> {
    const cacheKey = `schedule:${tourProductId}:${year}-${month}`;
    const cachedData = await this.redisService.get(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private async cacheSchedule(
    month: number,
    year: number,
    tourProductId: number,
    schedule: any,
  ): Promise<void> {
    const cacheKey = `schedule:${tourProductId}:${year}-${month}`;
    await this.redisService.put(cacheKey, schedule);
  }

  private async fetchScheduleFromDatabase(
    month: number,
    year: number,
    tour_product_id: number,
  ): Promise<any> {
    const tourProducts = await this.tourProductsRepository.find({
      where: { id: tour_product_id },
      relations: ['holidays'],
    });

    const schedules = tourProducts.map((tourProduct) => {
      const timezone = tourProduct.timezone;
      // 시작 날짜를 해당 시간대로 설정
      const startDate = moment.tz({ year, month: month - 1, day: 1 }, timezone);
      // 해당 시간대의 월 말일로 종료 날짜 설정
      const endDate = moment.tz(startDate, timezone).endOf('month');

      // 현재 날짜를 해당 시간대로 변환
      const currentDateLocal = moment.utc().tz(timezone);

      return {
        tourProductId: tourProduct.id,
        availableDates: this.getAvailableDates(
          startDate,
          endDate,
          tourProduct.holidays || [],
          currentDateLocal,
          timezone,
        ),
      };
    });

    return schedules;
  }

  private getAvailableDates(
    startDate: moment.Moment,
    endDate: moment.Moment,
    holidays: Holidays[],
    currentDateLocal: moment.Moment,
    timezone: string,
  ): string[] {
    const dates = [];
    const dateIterator = moment.tz(startDate, timezone);

    while (dateIterator.isBefore(endDate)) {
      const isHoliday = holidays.some((holiday) => {
        console.log(moment.tz(holiday.date, timezone));

        if (holiday.recurring) {
          // 요일에 따른 휴일인지 확인
          return dateIterator.format('dddd') === holiday.day_of_week;
        } else {
          // 특정 날짜에 따른 휴일인지 확인
          return moment.tz(holiday.date, timezone).isSame(dateIterator, 'day');
        }
      });

      // 로컬 시간대의 현재/과거 날짜를 제외
      if (dateIterator.isAfter(currentDateLocal, 'day') && !isHoliday) {
        dates.push(dateIterator.format('YYYY-MM-DD'));
      }

      dateIterator.add(1, 'days');
    }

    return dates;
  }
}
