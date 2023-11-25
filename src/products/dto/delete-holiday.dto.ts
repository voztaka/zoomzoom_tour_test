import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteHolidayDto {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
