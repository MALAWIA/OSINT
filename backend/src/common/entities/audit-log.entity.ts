import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column('varchar', { length: 50 })
  action: string;

  @Column('text')
  description: string;

  @Column('json', { nullable: true })
  metadata?: any;

  @Column('varchar', { length: 45, nullable: true })
  ipAddress?: string;

  @Column('varchar', { length: 500, nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.auditLogs)
  user?: User;
}
