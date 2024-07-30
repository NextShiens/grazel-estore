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

@Entity("products_gallery")
export class ProductsGallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column("longtext")
  image: string;

  @Column({ type: "tinyint", default: 1 })
  active: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @ManyToOne(() => Product, (product) => product.gallery)
  @JoinColumn({ name: "product_id" })
  product: Product;
}
