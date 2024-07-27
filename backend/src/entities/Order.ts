import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./Users";
import { OrderProduct } from "./OrderProduct";
import { OrderStatusHistory } from "./OrderHistory";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  reference_id: string;

  @Column({ type: "int" })
  user_id: number;

  @Column({ type: "int" })
  address_id: number;

  @Column({
    type: "enum",
    enum: ["cod", "creditcard", "paypal"],
    default: "cod",
  })
  payment_type: "cod" | "creditcard" | "paypal";

  @Column({ type: "varchar", length: 255, nullable: true })
  coupon_code: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  discount: string;

  @Column({ type: "datetime" })
  date: Date;

  @Column({
    type: "enum",
    enum: ["notpaid", "paid"],
    default: "notpaid",
  })
  payment: "notpaid" | "paid";

  @Column({ type: "varchar", length: 255, nullable: true })
  transaction_id: string;

  @Column({ type: "datetime", nullable: true })
  expected_delivery_date: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  tracking_id: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProducts: OrderProduct[];

  @OneToMany(() => OrderStatusHistory, (orderStatusHistory) => orderStatusHistory.order)
  status_history: OrderStatusHistory[];
}
