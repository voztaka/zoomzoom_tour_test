import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class CheckReservationDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  token: string;
}
