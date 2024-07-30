import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./Order";

@Entity("order_status_history")
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: ["new", "in_progress", "shipped", "completed", "cancelled", "return"],
  })
  status:
    | "new"
    | "in_progress"
    | "shipped"
    | "completed"
    | "cancelled"
    | "return";

  @CreateDateColumn({ type: "timestamp" })
  changed_at: Date;

  @ManyToOne(() => Order, (order) => order.status_history, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "order_id" })
  order: Order;
}
