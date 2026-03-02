import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Company } from './company.entity';

export enum CorporateActionType {
  DIVIDEND = 'dividend',
  STOCK_SPLIT = 'stock_split',
  RIGHTS_ISSUE = 'rights_issue',
  BONUS_ISSUE = 'bonus_issue',
  AGM = 'agm',
  EGM = 'egm',
  EARNINGS_RELEASE = 'earnings_release',
  LISTING = 'listing',
  DELISTING = 'delisting',
  SUSPENSION = 'suspension',
  OTHER = 'other',
}

@Entity('corporate_actions')
@Index(['companyId', 'actionDate'])
export class CorporateAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({
    type: 'enum',
    enum: CorporateActionType,
    default: CorporateActionType.OTHER,
  })
  actionType: CorporateActionType;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  actionDate: Date;

  @Column({ type: 'date', nullable: true })
  recordDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column('decimal', { precision: 12, scale: 4, nullable: true })
  value: number;

  @Column('json', { nullable: true })
  metadata: any;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ length: 255, nullable: true })
  sourceUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Company, company => company.corporateActions)
  company: Company;
}
