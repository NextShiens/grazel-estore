import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

enum BannerType {
  WEB = "web",
  MOBILE = "mobile",
}

@Entity("banners")
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  position: number;

  @Column()
  title: string;

  @Column({ type: "varchar", nullable: true })
  image: string | null;

  @Column({ type: "varchar", nullable: true })
  video: string | null;

  @Column({ default: false })
  active: boolean;

  @Column({
    type: "enum",
    enum: BannerType,
    default: BannerType.WEB,
  })
  type: BannerType;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
