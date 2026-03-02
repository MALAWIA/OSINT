import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Company } from './company.entity';

@Entity('stock_prices')
@Index(['companyId', 'tradedAt'])
export class StockPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column('decimal', { precision: 12, scale: 4 })
  open: number;

  @Column('decimal', { precision: 12, scale: 4 })
  high: number;

  @Column('decimal', { precision: 12, scale: 4 })
  low: number;

  @Column('decimal', { precision: 12, scale: 4 })
  close: number;

  @Column('bigint', { default: 0 })
  volume: number;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  change: number;

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  changePercent: number;

  @Column({ type: 'timestamp' })
  tradedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Company, company => company.stockPrices)
  company: Company;
}
