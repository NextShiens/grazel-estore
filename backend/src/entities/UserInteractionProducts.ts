import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product";

enum InteractionType {
  VIEW = "view",
  CLICK = "click",
  PURCHASE = "purchase",
}

@Entity("user_interactions_products")
export class UserInteractionProducts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  product_id: number;

  @ManyToOne(() => Product, (product) => product.interactions)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "enum", enum: InteractionType })
  interaction_type: InteractionType;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
