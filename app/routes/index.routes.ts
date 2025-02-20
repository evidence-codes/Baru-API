import express from 'express';

import userRouter from './user.routes';
import authRouter from './auth.routes';
import notificationRouter from './notification.routes';
import packageRouter from './package.routes';
import courierRouter from './courier.routes';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/packages', packageRouter);
router.use('/notifications', notificationRouter);
router.use('/courier', courierRouter);

export default router;
