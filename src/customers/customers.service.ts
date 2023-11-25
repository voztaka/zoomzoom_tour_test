import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customers } from './customers.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customers)
    private customersRepository: Repository<Customers>,
  ) {}

  async verifyCustomerExists(id: number): Promise<boolean> {
    const customer = await this.customersRepository.findOne({
      where: { id: id },
    });
    return !!customer;
  }
}
