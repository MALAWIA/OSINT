import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SentimentAnalysis } from './sentiment-analysis.entity';
import { CompanyMention } from './company-mention.entity';
import { DetectedEvent } from './detected-event.entity';
import { DiscussionChannel } from './discussion-channel.entity';
import { StockPrice } from './stock-price.entity';
import { CorporateAction } from './corporate-action.entity';
import { RegulatoryFeed } from './regulatory-feed.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 10 })
  ticker: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  sector: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ type: 'date', nullable: true })
  listedDate: Date;

  @Column({ type: 'bigint', nullable: true })
  marketCap: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  hasRegulatoryFlag: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SentimentAnalysis, sentiment => sentiment.company)
  sentimentAnalysis: SentimentAnalysis[];

  @OneToMany(() => CompanyMention, mention => mention.company)
  mentions: CompanyMention[];

  @OneToMany(() => DetectedEvent, event => event.company)
  events: DetectedEvent[];

  @OneToMany(() => DiscussionChannel, channel => channel.company)
  channels: DiscussionChannel[];

  @OneToMany(() => StockPrice, price => price.company)
  stockPrices: StockPrice[];

  @OneToMany(() => CorporateAction, action => action.company)
  corporateActions: CorporateAction[];

  @OneToMany(() => RegulatoryFeed, feed => feed.company)
  regulatoryFeeds: RegulatoryFeed[];
}
