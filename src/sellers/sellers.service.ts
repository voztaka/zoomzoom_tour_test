import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sellers } from './sellers.entity';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Sellers)
    private sellersRepository: Repository<Sellers>,
  ) {}

  async verifySellerExists(id: number): Promise<boolean> {
    const seller = await this.sellersRepository.findOne({
      where: { id: id },
    });
    return !!seller;
  }
}
