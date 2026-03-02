import { User } from './user.entity';
export declare class AuditLog {
    id: string;
    userId?: string;
    action: string;
    description: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    user?: User;
}
