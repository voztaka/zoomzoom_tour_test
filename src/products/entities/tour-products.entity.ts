import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BaseEntity,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Holidays } from './holidays.entity';
import { Sellers } from 'src/sellers/sellers.entity';

@Entity('tour_products')
export class TourProducts extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sellers)
  @JoinColumn({ name: 'seller_id' })
  seller: Sellers;

  @OneToMany(() => Holidays, (holidays) => holidays.tourProduct)
  holidays: Holidays[];

  @Column('varchar', { length: 255, nullable: false })
  name: string;

  @Column('int', { nullable: false })
  capacity: number;

  @Column('varchar', { length: 255, nullable: false })
  timezone: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
