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

@Entity("product_faqs")
export class ProductFaqs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column("longtext")
  question: string;

  @Column("longtext")
  answer: string;

  @Column({ type: "tinyint", default: 1 })
  active: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => Product, (product) => product.faqs, {
    cascade: ["remove"],
  })
  @JoinColumn({ name: "product_id" })
  product: Product;
}
