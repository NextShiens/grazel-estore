import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("referrals")
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender_user_id: number;

  @Column({ type: "varchar", length: 255 })
  referral_link: string;

  @Column({ type: "varchar", length: 255 })
  referral_code: string;

  @Column({ type: "enum", enum: ["sent", "joined"], default: "sent" })
  status: "sent" | "joined";

  @Column({ nullable: true })
  receiver_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
