import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column('varchar', { length: 100 })
  preferenceKey: string;

  @Column('json')
  preferenceValue: any;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.preferences)
  user: User;
}
