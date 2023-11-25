import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customers')
export class Customers {
  @PrimaryGeneratedColumn()
  id: number;
}
