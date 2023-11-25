import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sellers')
export class Sellers {
  @PrimaryGeneratedColumn()
  id: number;
}
