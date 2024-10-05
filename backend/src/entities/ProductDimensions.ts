import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
  } from "typeorm";
  import { Product } from "./Product";
  
  @Entity("product_dimensions")
  export class ProductDimensions {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: "decimal", precision: 10, scale: 2 })
    length: number;
  
    @Column({ type: "decimal", precision: 10, scale: 2 })
    width: number;
  
    @Column({ type: "decimal", precision: 10, scale: 2 })
    height: number;
  
    @Column({ type: "decimal", precision: 10, scale: 2 })
    weight: number;
  
    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;
  
    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;
  
    @OneToOne(() => Product, (product) => product.dimensions)
    @JoinColumn({ name: "product_id" })
    product: Product;
  }
  