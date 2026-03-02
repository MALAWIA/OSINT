import { NotificationsService } from './notifications.service';
import { User } from '../common/entities/user.entity';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(user: User): Promise<any[]>;
    getUnreadCount(user: User): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<{
        success: boolean;
    }>;
    markAllAsRead(user: User): Promise<{
        success: boolean;
    }>;
    deleteNotification(id: string): Promise<{
        success: boolean;
    }>;
}
