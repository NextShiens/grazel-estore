import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./Users";
import { Role } from "./Roles";

@Entity("user_has_roles")
export class UserHasRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userHasRole, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Role, (role) => role.userHasRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role: Role;
}
