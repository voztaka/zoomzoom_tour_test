import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservations } from './entities/reservations.entity';
import { TourProducts } from './entities/tour-products.entity';
import { ReservationsService } from './services/reservations.service';
import { SellersReservationController } from './controllers/sellers-reservations.controller';
import { CustomersReservationController } from './controllers/customers-reservations.controller';
import { TourProductsService } from './services/tour-products.service';
import { Holidays } from './entities/holidays.entity';
import { HolidaysService } from './services/holidays.service';
import { SellersHolidaysController } from './controllers/sellers-holidays.controller';
import { CustomersTourProductsController } from './controllers/customers-tour-products.controller';
import { RedisModule } from 'src/utils/redis/redis.module';
import { CustomersModule } from 'src/customers/customers.module';
import { SellersModule } from 'src/sellers/sellers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservations, TourProducts, Holidays]),
    RedisModule,
    CustomersModule,
    SellersModule,
  ],
  controllers: [
    SellersReservationController,
    CustomersReservationController,
    SellersHolidaysController,
    CustomersTourProductsController,
  ],
  providers: [ReservationsService, TourProductsService, HolidaysService],
})
export class ProductsModule {}
