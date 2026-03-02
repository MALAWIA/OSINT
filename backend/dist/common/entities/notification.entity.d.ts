import { User } from './user.entity';
export declare class Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    data?: any;
    createdAt: Date;
    user: User;
}
