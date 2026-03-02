import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('moderation_flags')
export class ModerationFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  flaggerId: string;

  @Column({ type: 'uuid', nullable: true })
  moderatorId?: string;

  @Column({ type: 'uuid', nullable: true })
  messageId?: string;

  @Column({
    type: 'enum',
    enum: ['spam', 'inappropriate', 'financial_advice', 'misinformation', 'harassment', 'other'],
    default: 'other'
  })
  reason: 'spam' | 'inappropriate' | 'financial_advice' | 'misinformation' | 'harassment' | 'other';

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  })
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';

  @Column('text', { nullable: true })
  moderatorNotes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.flaggedItems)
  flagger: User;

  @ManyToOne(() => User, user => user.moderatedItems)
  moderator?: User;

  @ManyToOne(() => Message, message => message)
  message?: Message;
}
