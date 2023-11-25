import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { IsDateString } from 'src/common/validations/IsDateString';

export class CreateHolidayDto {
  @IsInt()
  tourProductId: number;

  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsIn([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ])
  dayOfWeek?: string;
}
