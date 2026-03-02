import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { NewsArticle } from './news-article.entity';
import { Company } from './company.entity';

@Entity('sentiment_analysis')
export class SentimentAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ type: 'uuid', nullable: true })
  companyId?: string;

  @Column('decimal', { precision: 3, scale: 2 })
  sentimentScore: number;

  @Column({
    type: 'enum',
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  })
  sentimentLabel: 'positive' | 'negative' | 'neutral';

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  confidence?: number;

  @Column('json', { nullable: true })
  entities?: any[];

  @Column('json', { nullable: true })
  keywords?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => NewsArticle, article => article.sentimentAnalysis)
  article: NewsArticle;

  @ManyToOne(() => Company, company => company.sentimentAnalysis)
  company?: Company;
}
