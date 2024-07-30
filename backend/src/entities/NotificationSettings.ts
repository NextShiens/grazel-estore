import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./Users";

@Entity("notification_settings")
export class NotificationSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  email: boolean;

  @Column({ default: false })
  offer_and_promotion: boolean;

  @Column({ default: false })
  newsletter: boolean;

  @Column({ default: false })
  personalized: boolean;
  
  @OneToOne(() => User, (user) => user.notification_settings)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  user_id: number;
}
