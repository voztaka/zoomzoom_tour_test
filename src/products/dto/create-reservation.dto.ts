import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @IsNotEmpty()
  tourProductId: number;

  @Transform(({ value }) => value.trim())
  @IsDateString()
  date: string;
}
