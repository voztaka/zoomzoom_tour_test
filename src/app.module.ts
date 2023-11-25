import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { SellersModule } from './sellers/sellers.module';
import { ProductsModule } from './products/products.module';
import { Reservations } from './products/entities/reservations.entity';
import { Customers } from './customers/customers.entity';
import { Sellers } from './sellers/sellers.entity';
import { TourProducts } from './products/entities/tour-products.entity';
import { Holidays } from './products/entities/holidays.entity';
import { RedisModule } from './utils/redis/redis.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3311,
      username: 'root',
      password: '1234',
      database: 'zoomzoom_tour',
      entities: [Reservations, Customers, Sellers, TourProducts, Holidays],
      synchronize: false,
      // logging: true,
    }),
    RedisModule,
    CustomersModule,
    SellersModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
