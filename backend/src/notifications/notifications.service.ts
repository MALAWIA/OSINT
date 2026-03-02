import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private notifications: any[] = [];

  async createNotification(userId: string, type: string, title: string, message: string, data?: any) {
    const notification = {
      id: String(this.notifications.length + 1),
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.push(notification);
    return notification;
  }

  async getUserNotifications(userId: string, limit = 50) {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  async markAllAsRead(userId: string) {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.isRead = true);
  }

  async deleteNotification(notificationId: string) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  async getUnreadCount(userId: string) {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }
}
