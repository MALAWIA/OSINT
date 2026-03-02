import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('message_reactions')
export class MessageReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  messageId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column('varchar', { length: 50 })
  reactionType: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.reactions)
  user: User;

  @ManyToOne(() => Message, message => message.reactions)
  message: Message;
}
