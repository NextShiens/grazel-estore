import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { City } from './City';

@Entity('states')
export class State extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => City, (city) => city.state, { cascade: true, onDelete: 'CASCADE' })
  cities: City[];
}
