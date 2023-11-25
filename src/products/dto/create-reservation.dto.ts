import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @IsNotEmpty()
  tourProductId: number;

  @IsDateString()
  date: string;
}
