import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Profile } from "./Profiles";
import { UserHasRole } from "./UserHasRoles";
import { Address } from "./Address";
import { Order } from "./Order";
import { RecentlyViewed } from "./RecentlyViewed";
import { FavoriteProduct } from "./FavoriteProducts";
import { Review } from "./Review";
import { NotificationSettings } from "./NotificationSettings";
import { StoreProfile } from "./StoreProfile";
import { MembershipPlan } from "./MembershipPlan";
import { UserMembership } from "./UserMembership";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: true })
  google_id?: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  username: string;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @Column({ default: 0 })
  score: number;

  @Column({ type: "boolean", default: false })
  is_deleted: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => StoreProfile, (storeProfile) => storeProfile.user)
  store_profile: StoreProfile;

  @OneToOne(() => UserHasRole, (userHasRole) => userHasRole.user)
  userHasRole: UserHasRole;

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => RecentlyViewed, (recentlyViewed) => recentlyViewed.user)
  recentlyViewed: RecentlyViewed[];

  @OneToMany(() => FavoriteProduct, (favoriteProduct) => favoriteProduct.user)
  favoriteProducts: FavoriteProduct[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToOne(
    () => NotificationSettings,
    (notificationSettings) => notificationSettings.user,
    {
      cascade: ["insert", "update"],
    }
  )
  notification_settings: NotificationSettings;

  @OneToMany(() => UserMembership, (userMembership) => userMembership.user)
  memberships: UserMembership[];
}
