import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { MembershipPlan } from "./MembershipPlan";
import { User } from "./Users";

@Entity()
export class UserMembership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.memberships)
  user: User;

  @ManyToOne(
    () => MembershipPlan,
    (membershipPlan) => membershipPlan.user_memberships
  )
  membership_plan: MembershipPlan;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @Column({ default: false })
  is_active: boolean;

  @Column({
    type: "enum",
    enum: ["inactive", "active", "expired"],
  })
  status: "inactive" | "active" | "expired";

  @Column({ type: "varchar", length: 255, nullable: true })
  transaction_id: string | null;

  @Column({
    type: "enum",
    enum: ["paid", "notpaid"],
  })
  payment_status: "paid" | "notpaid";

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
