import { Transform } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class ScheduleQueryDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  tour_product_id: number;
}
