import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" }) 
  body: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  url: string;

  @Column("json", { nullable: true })
  data: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
