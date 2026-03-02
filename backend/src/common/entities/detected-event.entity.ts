import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { NewsArticle } from './news-article.entity';
import { Company } from './company.entity';

@Entity('detected_events')
export class DetectedEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ type: 'uuid', nullable: true })
  companyId?: string;

  @Column({
    type: 'enum',
    enum: ['earnings', 'merger', 'acquisition', 'dividend', 'stock_split', 'management_change', 'regulatory', 'other'],
    default: 'other'
  })
  eventType: 'earnings' | 'merger' | 'acquisition' | 'dividend' | 'stock_split' | 'management_change' | 'regulatory' | 'other';

  @Column('text')
  eventText: string;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  confidence?: number;

  @Column('json', { nullable: true })
  metadata?: any;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  detectedAt: Date;

  @ManyToOne(() => NewsArticle, article => article.events)
  article: NewsArticle;

  @ManyToOne(() => Company, company => company.events)
  company?: Company;
}
