import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("credit_limit_requests")
export class CreditLimitRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop_name: string;

  @Column()
  phone_number: string;

  @Column()
  email: string;

  @Column()
  shop_address: string;

  @Column()
  aadhar_card: string;

  @Column()
  pin_card_number: string;

  @Column({
    type: "enum",
    enum: ["new", "completed", "reject"],
    default: "new",
  })
  status: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;
}
