import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { Company } from './company.entity';

@Entity('portfolio_holdings')
@Index(['portfolioId', 'companyId'], { unique: true })
export class PortfolioHolding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  portfolioId: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column('decimal', { precision: 12, scale: 4 })
  quantity: number;

  @Column('decimal', { precision: 12, scale: 4 })
  averageBuyPrice: number;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  currentPrice: number;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  totalValue: number;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  profitLoss: number;

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  profitLossPercent: number;

  @Column({ type: 'timestamp', nullable: true })
  lastPriceUpdate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Portfolio, portfolio => portfolio.holdings)
  portfolio: Portfolio;

  @ManyToOne(() => Company)
  company: Company;
}
