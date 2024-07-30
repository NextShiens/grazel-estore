import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("search_keywords")
export class SearchKeyword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  keyword: string;

  @Column({ default: 1 }) // Default count is 1
  count: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;
}
