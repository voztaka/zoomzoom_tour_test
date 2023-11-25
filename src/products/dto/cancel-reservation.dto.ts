import { IsString, IsNotEmpty } from 'class-validator';

export class CancelReservationDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
