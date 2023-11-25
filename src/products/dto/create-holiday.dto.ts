import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { IsDateString } from 'src/common/validations/IsDateString';

export class CreateHolidayDto {
  @IsInt()
  tourProductId: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
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
