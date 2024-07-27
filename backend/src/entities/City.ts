import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
  JoinColumn,
} from "typeorm";
import { State } from "./State";

@Entity("cities")
export class City extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @ManyToOne(() => State, (state) => state.cities)
  @JoinColumn({ name: "state_id" }) // Specify the column name explicitly if needed
  state: State;
}
