import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./Product";
import { User } from "./Users";

@Entity("favorite_products")
export class FavoriteProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favoriteProducts, {
    onDelete: "CASCADE",
  })
  user: User;

  @ManyToOne(() => Product, (product) => product.favoriteProducts, {
    onDelete: "CASCADE",
  })
  product: Product;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
