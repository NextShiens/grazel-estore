import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { Product } from "./Product";
import { ProductDimensions } from "./ProductDimensions";

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

  @OneToOne(() => ProductDimensions, { cascade: true })
  @JoinColumn({ name: "dimensions_id" })
  dimensions: ProductDimensions;

  @ManyToOne(
    () => Product,
    (product) => product.variants,

    {
      cascade: ["remove"],
    }
  )
  product: Product;
}
