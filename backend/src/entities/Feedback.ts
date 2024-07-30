import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity("feedbacks")
export class Feedback {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    subject: string;

    @Column({ type: 'text' })
    message: string;

    @CreateDateColumn({ name: "created_at" })
    created_at: Date;
  
    @UpdateDateColumn({ name: "updated_at" })
    updated_at: Date;
}
