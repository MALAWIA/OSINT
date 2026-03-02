import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { DiscussionChannel } from './discussion-channel.entity';
import { NewsArticle } from './news-article.entity';
import { MessageReaction } from './message-reaction.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  channelId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column('text')
  content: string;

  @Column({ type: 'uuid', nullable: true })
  articleId?: string;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.messages)
  user: User;

  @ManyToOne(() => DiscussionChannel, channel => channel.messages)
  channel: DiscussionChannel;

  @ManyToOne(() => NewsArticle, article => article.messages)
  article?: NewsArticle;

  @OneToMany(() => MessageReaction, reaction => reaction.message)
  reactions: MessageReaction[];
}
