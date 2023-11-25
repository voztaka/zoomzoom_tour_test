import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { TourProducts } from '../entities/tour-products.entity';
import { ScheduleQueryDto } from '../dto/schedule-query.dto';
import { Holidays } from '../entities/holidays.entity';
import { RedisService } from 'src/utils/redis/redis.service';
import { ScheduleItem } from '../interfaces/schedule-item.interface';

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
    let schedule = await this.checkCachedSchedule(
      dto.month,
      dto.year,
      dto.tour_product_id,
    );

    if (!schedule) {
      schedule = await this.fetchScheduleFromDatabase(
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
    } else {
      // 캐시된 데이터를 현재 날짜와 비교하여 필터링
      const currentTime = this.getCurrentTime(schedule[0].timezone);
      schedule.forEach((s: ScheduleItem) => {
        s.availableDates = s.availableDates.filter((date: string) =>
          moment.tz(date, 'YYYY-MM-DD', s.timezone).isAfter(currentTime, 'day'),
        );
      });
    }

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

  private isHoliday(
    date: moment.Moment,
    holidays: Holidays[],
    timezone: string,
  ): boolean {
    return holidays.some((holiday) => {
      if (holiday.recurring) {
        return date.format('dddd') === holiday.day_of_week;
      } else {
        return moment.tz(holiday.date, timezone).isSame(date, 'day');
      }
    });
  }

  private generateDateRange(
    startDate: moment.Moment,
    endDate: moment.Moment,
  ): moment.Moment[] {
    const dates = [];
    const dateIterator = startDate.clone();

    while (dateIterator.isBefore(endDate)) {
      dates.push(dateIterator.clone());
      dateIterator.add(1, 'days');
    }

    return dates;
  }

  public async fetchScheduleFromDatabase(
    month: number,
    year: number,
    tour_product_id: number,
  ): Promise<any> {
    const tourProducts = await this.tourProductsRepository.find({
      where: { id: tour_product_id },
      relations: ['holidays'],
    });

    return tourProducts.map((tourProduct) => {
      const timezone = tourProduct.timezone;
      const startDate = moment.tz({ year, month: month - 1, day: 1 }, timezone);
      const endDate = moment.tz(startDate, timezone).endOf('month');
      const currentDateLocal = this.getCurrentTime(tourProduct.timezone);
      const dateRange = this.generateDateRange(startDate, endDate);

      const availableDates = dateRange
        .filter(
          (date) =>
            date.isAfter(currentDateLocal, 'day') &&
            !this.isHoliday(date, tourProduct.holidays, timezone),
        )
        .map((date) => date.format('YYYY-MM-DD'));

      return {
        tourProductId: tourProduct.id,
        availableDates,
        timezone,
      };
    });
  }

  public getCurrentTime(timezone: string) {
    return moment.utc().tz(timezone);
  }
}
