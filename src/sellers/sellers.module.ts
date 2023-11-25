import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sellers } from './sellers.entity';
import { SellersService } from './sellers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sellers])],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule {}
