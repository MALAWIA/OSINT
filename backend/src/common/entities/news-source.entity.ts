import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { NewsArticle } from './news-article.entity';

@Entity('news_sources')
export class NewsSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ unique: true, length: 500 })
  url: string;

  @Column({
    type: 'enum',
    enum: ['rss', 'api', 'web_scraping'],
    default: 'web_scraping'
  })
  sourceType: 'rss' | 'api' | 'web_scraping';

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  config?: any;

  @Column({ type: 'int', default: 0 })
  articleCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => NewsArticle, article => article.source)
  articles: NewsArticle[];
}
