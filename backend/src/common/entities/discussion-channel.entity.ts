import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { Message } from './message.entity';

@Entity('discussion_channels')
export class DiscussionChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column({
    type: 'enum',
    enum: ['stock', 'general', 'sector'],
    default: 'general'
  })
  channelType: 'stock' | 'general' | 'sector';

  @Column({ type: 'uuid', nullable: true })
  companyId?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.createdChannels)
  creator: User;

  @ManyToOne(() => Company, company => company.channels)
  company?: Company;

  @OneToMany(() => Message, message => message.channel)
  messages: Message[];
}
