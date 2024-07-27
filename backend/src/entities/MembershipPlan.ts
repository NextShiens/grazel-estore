import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserMembership } from "./UserMembership";

@Entity("membership_plans")
export class MembershipPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: "int", nullable: false })
  duration_months: number;

  @Column({ type: "int", nullable: false })
  discount: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @OneToMany(
    () => UserMembership,
    (userMembership) => userMembership.membership_plan
  )
  user_memberships: UserMembership[];
}
