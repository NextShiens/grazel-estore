import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  OneToOne,
} from "typeorm";
import { ProductsGallery } from "./productGallery";
import { RecentlyViewed } from "./RecentlyViewed";
import { UserInteractionProducts } from "./UserInteractionProducts";
import { FavoriteProduct } from "./FavoriteProducts";
import { Review } from "./Review";
import { Offer } from "./Offer";
import { Order } from "./Order";
import { OrderProduct } from "./OrderProduct";
import { ProductFaqs } from "./ProductFaqs";
import { ProductVariant } from "./ProductVariant";
import { ProductDimensions } from "./ProductDimensions";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  category_id: number;

  @Column({ nullable: true })
  brand_id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: "varchar", length: 100, unique: true })
  sku: string;

  @Column({ type: "longtext", nullable: true })
  featured_image: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "longtext", nullable: true })
  description: string;

  @Column({ type: "longtext", nullable: true })
  product_info: string;

  @Column({ type: "longtext", nullable: true })
  tags: string;

  @Column({ default: 1 })
  active: number;

  @Column({ type: "boolean", default: false })
  is_sponsored: boolean;

  @Column({ type: "boolean", default: false })
  is_festival_event: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @OneToMany(() => ProductsGallery, (gallery) => gallery.product)
  gallery: ProductsGallery[];

  @OneToMany(() => ProductFaqs, (faqs) => faqs.product)
  faqs: ProductFaqs[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => RecentlyViewed, (recentlyViewed) => recentlyViewed.product)
  recentlyViewed: RecentlyViewed[];

  @OneToMany(
    () => UserInteractionProducts,
    (interaction) => interaction.product
  )
  interactions: UserInteractionProducts[];

  @OneToMany(
    () => FavoriteProduct,
    (favoriteProduct) => favoriteProduct.product
  )
  favoriteProducts: FavoriteProduct[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @Column({ nullable: true })
  offer_id: number;

  @ManyToOne(() => Offer, (offer) => offer.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "offer_id" })
  offer: Offer | null;

  @Column({ type: "decimal", precision: 3, nullable: true })
  discount: number | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  discounted_price: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  color: string;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
  orderProducts: OrderProduct[];

  @OneToOne(() => ProductDimensions, (dimensions) => dimensions.product, {
    cascade: true,
  })
  dimensions: ProductDimensions;
}
