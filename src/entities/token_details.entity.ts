import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'token_details' })
export default class TokenDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'colleague_id' })
  colleagueId: string;

  @Column({ name: 'secret_num' })
  secretNum: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
