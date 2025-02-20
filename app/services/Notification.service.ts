import { NotificationsRepository } from '../ormconfig';
import { Notifications, NotificationType } from '../models/Notifications';
import { User } from '../models/User';

class NotificationService {
  private notificationRepository = NotificationsRepository;

  async createNotification(
    user: User,
    type: NotificationType,
    message: string,
    meta_data?: string,
  ) {
    const notification = this.notificationRepository.create({
      user,
      type,
      message,
    });
    if (meta_data) {
      notification.meta_data = meta_data;
    }

    await this.notificationRepository.save(notification);

    return notification;
  }

  async getAllNotifications(user: User) {
    return await this.notificationRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateNotification(
    notification: Notifications,
    data: Partial<Notifications>,
  ) {
    Object.assign(notification, data);
    await this.notificationRepository.save(notification);
  }
  async getNotificationById(id: string) {
    return await this.notificationRepository.findOne({ where: { id } });
  }
  async deleteNotifications(user: User) {
    await this.notificationRepository.delete({
      user: { id: user.id },
    });
  }
}

export default new NotificationService();
