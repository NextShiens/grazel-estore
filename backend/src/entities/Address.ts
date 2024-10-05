import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./Users";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  address: string;

  @Column({ nullable: true })
  address_label: string;

  @Column({ type: "text", nullable: true })
  note: string;

  @Column()
  recipient_name: string;

  @Column()
  recipient_phone: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: "int" })
  pin_code: string;

  @Column({ default: false })
  primary_location: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
