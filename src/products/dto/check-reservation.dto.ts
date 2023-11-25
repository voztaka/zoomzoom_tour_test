import { IsString, IsNotEmpty } from 'class-validator';

export class CheckReservationDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
