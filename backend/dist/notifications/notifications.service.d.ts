export declare class NotificationsService {
    private notifications;
    createNotification(userId: string, type: string, title: string, message: string, data?: any): Promise<{
        id: string;
        userId: string;
        type: string;
        title: string;
        message: string;
        data: any;
        isRead: boolean;
        createdAt: string;
    }>;
    getUserNotifications(userId: string, limit?: number): Promise<any[]>;
    markAsRead(notificationId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
