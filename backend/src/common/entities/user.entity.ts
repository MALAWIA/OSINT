import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';
import { MessageReaction } from './message-reaction.entity';
import { ModerationFlag } from './moderation-flag.entity';
import { Notification } from './notification.entity';
import { UserPreference } from './user-preference.entity';
import { AuditLog } from './audit-log.entity';
import { DiscussionChannel } from './discussion-channel.entity';
import { Portfolio } from './portfolio.entity';
import { PriceAlert } from './price-alert.entity';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 100, nullable: true })
  displayName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isModerator: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: 0 })
  reputationScore: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActive: Date;

  @OneToMany(() => Message, message => message.user)
  messages: Message[];

  @OneToMany(() => MessageReaction, reaction => reaction.user)
  reactions: MessageReaction[];

  @OneToMany(() => ModerationFlag, flag => flag.flagger)
  flaggedItems: ModerationFlag[];

  @OneToMany(() => ModerationFlag, flag => flag.moderator)
  moderatedItems: ModerationFlag[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => UserPreference, preference => preference.user)
  preferences: UserPreference[];

  @OneToMany(() => AuditLog, audit => audit.user)
  auditLogs: AuditLog[];

  @OneToMany(() => DiscussionChannel, channel => channel.creator)
  createdChannels: DiscussionChannel[];

  @OneToMany(() => Portfolio, portfolio => portfolio.user)
  portfolios: Portfolio[];

  @OneToMany(() => PriceAlert, alert => alert.user)
  priceAlerts: PriceAlert[];
}
