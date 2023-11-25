import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import { TourProductsService } from 'src/products/services/tour-products.service';
import { TourProducts } from 'src/products/entities/tour-products.entity';
import { RedisService } from 'src/utils/redis/redis.service';

describe('TourProductsService', () => {
  let service: TourProductsService;
  let mockRedisService: Partial<RedisService>;
  let mockTourProductsRepository: Partial<Repository<TourProducts>>;

  beforeEach(async () => {
    mockRedisService = {};
    mockTourProductsRepository = {
      find: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 1) {
          return Promise.resolve([
            {
              id: 1,
              name: 'Seoul Tour',
              timezone: 'Asia/Seoul',
              holidays: [
                { date: '2023-12-11', recurring: false },
                { day_of_week: 'Sunday', recurring: true },
              ],
            },
          ]);
        }
        if (where.id === 2) {
          return Promise.resolve([
            {
              id: 2,
              name: 'LA Tour',
              timezone: 'America/Los_Angeles',
              holidays: [
                { date: '2023-12-31', recurring: false },
                { date: '2023-12-16', recurring: false },
                { day_of_week: 'Monday', recurring: true },
                { day_of_week: 'Saturday', recurring: true },
              ],
            },
          ]);
        }

        return Promise.resolve([]);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourProductsService,
        {
          provide: getRepositoryToken(TourProducts),
          useValue: mockTourProductsRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<TourProductsService>(TourProductsService);

    service.getCurrentTime = jest
      .fn()
      .mockImplementation((timezone: string) => {
        return moment.tz('2023-12-03T03:00:00', timezone);
      });
  });

  it('should correctly calculate available dates for a Seoul tour product', async () => {
    const result = await service.fetchScheduleFromDatabase(12, 2023, 1);

    const schedule = result.find((item) => item.tourProductId === 1);

    expect(schedule.availableDates).toContain('2023-12-05');
    expect(schedule.availableDates).toContain('2023-12-30');
    expect(schedule.availableDates).not.toContain('2023-11-30');
    expect(schedule.availableDates).not.toContain('2023-12-01');
    expect(schedule.availableDates).not.toContain('2023-12-11');
    expect(schedule.availableDates).not.toContain('2023-12-17');
    expect(schedule.availableDates).not.toContain('2023-12-24');
    expect(schedule.availableDates).not.toContain('2024-01-01');

    const expectedLength = 23;
    expect(schedule.availableDates).toHaveLength(expectedLength);
  });

  it('should correctly calculate available dates for an LA tour product', async () => {
    const result = await service.fetchScheduleFromDatabase(12, 2023, 2);
    const schedule = result.find((item) => item.tourProductId === 2);

    expect(schedule.availableDates).toContain('2023-12-05');
    expect(schedule.availableDates).toContain('2023-12-29');
    expect(schedule.availableDates).not.toContain('2023-11-30');
    expect(schedule.availableDates).not.toContain('2023-12-03');
    expect(schedule.availableDates).not.toContain('2023-12-04');
    expect(schedule.availableDates).not.toContain('2023-12-16');
    expect(schedule.availableDates).not.toContain('2023-12-30');
    expect(schedule.availableDates).not.toContain('2023-12-31');
    expect(schedule.availableDates).not.toContain('2024-01-01');

    const expectedLength = 19;
    expect(schedule.availableDates).toHaveLength(expectedLength);
  });
});
