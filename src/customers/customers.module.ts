import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from './customers.entity';
import { CustomersService } from './customers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customers])],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
