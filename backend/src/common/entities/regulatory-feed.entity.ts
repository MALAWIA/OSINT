import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Company } from './company.entity';
import { User } from './user.entity';

export enum RegulatoryFeedStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum RegulatorySource {
  CMA = 'cma',
  NSE = 'nse',
  CBK = 'cbk',
  GOVERNMENT = 'government',
  OTHER = 'other',
}

@Entity('regulatory_feeds')
@Index(['companyId', 'publishedAt'])
export class RegulatoryFeed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  companyId: string;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({
    type: 'enum',
    enum: RegulatorySource,
    default: RegulatorySource.CMA,
  })
  source: RegulatorySource;

  @Column({ length: 255, nullable: true })
  sourceUrl: string;

  @Column({
    type: 'enum',
    enum: RegulatoryFeedStatus,
    default: RegulatoryFeedStatus.PENDING,
  })
  status: RegulatoryFeedStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewedById: string;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'timestamp' })
  publishedAt: Date;

  @Column('simple-array', { nullable: true })
  affectedTickers: string[];

  @Column('json', { nullable: true })
  metadata: any;

  @Column({ default: false })
  isUrgent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Company, company => company.regulatoryFeeds)
  company: Company;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy: User;
}
