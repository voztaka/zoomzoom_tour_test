import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customers } from '../../customers/customers.entity';
import { TourProducts } from './tour-products.entity';

@Entity('reservations')
export class Reservations {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customers)
  @JoinColumn({ name: 'customer_id' })
  customer: Customers;

  @ManyToOne(() => TourProducts)
  @JoinColumn({ name: 'tour_product_id' })
  tourProduct: TourProducts;

  @Column({ type: 'date' })
  date: Date | string;

  @Column({ type: 'enum', enum: ['Pending', 'Approved', 'Cancelled'] })
  status: string;

  @Column({ length: 255, unique: true })
  token: string;

  @Column({ type: 'timestamp', nullable: true })
  token_used_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
