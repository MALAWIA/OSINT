import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { NewsSource } from './news-source.entity';
import { CompanyMention } from './company-mention.entity';
import { SentimentAnalysis } from './sentiment-analysis.entity';
import { DetectedEvent } from './detected-event.entity';
import { Message } from './message.entity';

@Entity('news_articles')
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => NewsSource, source => source.articles)
  source: NewsSource;

  @Column({ length: 500 })
  title: string;

  @Column({ length: 1000, unique: true })
  url: string;

  @Column({ type: 'text' })
  rawText: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  fetchedAt: Date;

  @Column({ length: 64, unique: true })
  contentHash: string;

  @Column({ default: false })
  isProcessed: boolean;

  @OneToMany(() => CompanyMention, mention => mention.article)
  mentions: CompanyMention[];

  @OneToMany(() => SentimentAnalysis, sentiment => sentiment.article)
  sentimentAnalysis: SentimentAnalysis[];

  @OneToMany(() => DetectedEvent, event => event.article)
  events: DetectedEvent[];

  @OneToMany(() => Message, message => message.article)
  messages: Message[];
}
