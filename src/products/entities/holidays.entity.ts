import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TourProducts } from './tour-products.entity';

@Entity('holidays')
export class Holidays {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TourProducts, (tourProduct) => tourProduct.holidays)
  @JoinColumn({ name: 'tour_product_id' })
  tourProduct: TourProducts;

  @Column({ type: 'date', nullable: true })
  date: Date | string;

  @Column({
    type: 'enum',
    enum: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    nullable: true,
  })
  day_of_week: string;

  @Column('boolean', { default: false })
  recurring: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
