import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Product } from "./Product";

@Entity("product_variants")
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  variant: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  color: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  measurements: string;

  @ManyToOne(
    () => Product,
    (product) => product.variants,

    {
      cascade: ["remove"],
    }
  )
  product: Product;
}
