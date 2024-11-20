// connection.routes.ts

import express from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import notificationController from '../controllers/notification.controller';

const notificationRouter = express.Router();

// Apply authentication middleware to all connection routes
notificationRouter.use(isAuthenticated);

notificationRouter
  .get('/', notificationController.getNotifications)
  .delete('/', notificationController.deleteNotifications);
notificationRouter.put('/:id/read', notificationController.markAsRead);

export default notificationRouter;
