import { NotificationsRepository } from '../ormconfig';
import { BadRequestError } from '../utils/error';
import { successResponse } from '../utils/response.handler';
import { catchAsync } from '../utils/helpers';
import { Request } from '../types/express';
import { Response } from 'express';
import { User } from '../models/User';
import NotificationService from '../services/Notification.service';

class NotificationController {
  constructor(private readonly notificationService = NotificationService) {}
  getNotifications = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as User;
    const notifications =
      await this.notificationService.getAllNotifications(user);
    return successResponse({
      res,
      message: 'Notifications fetched successfully',
      data: notifications,
    });
  });

  markAsRead = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await this.notificationService.getNotificationById(
      id!,
    );

    if (!notification) {
      throw new BadRequestError('Notification not found');
    }

    await this.notificationService.updateNotification(notification, {
      read: true,
    });

    return successResponse({ res, message: 'Notification marked as read' });
  });
  deleteNotifications = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as User;
    await this.notificationService.deleteNotifications(user);
    return successResponse({ res, message: 'Notifications deleted' });
  });
}

export default new NotificationController();
