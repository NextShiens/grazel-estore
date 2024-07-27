import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Review } from "./Review";

@Entity("review_images")
export class ReviewImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  review_id: number;

  @Column({ type: "text" })
  image_url: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => Review, (review) => review.images)
  @JoinColumn({ name: "review_id" })
  review: Review;
}
