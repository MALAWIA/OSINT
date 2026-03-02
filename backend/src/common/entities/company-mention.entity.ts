import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { NewsArticle } from './news-article.entity';
import { Company } from './company.entity';

@Entity('company_mentions')
export class CompanyMention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column('text')
  mentionText: string;

  @Column('int')
  position: number;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  confidence?: number;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => NewsArticle, article => article.mentions)
  article: NewsArticle;

  @ManyToOne(() => Company, company => company.mentions)
  company: Company;
}
