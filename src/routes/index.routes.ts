import express from 'express';

import userRouter from './user.routes';
import authRouter from './auth.routes';
// import sessionRouter from './session.routes';
// import connectionRouter from './connections.routes';
import notificationRouter from './notification.routes';
const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
// router.use('/session', sessionRouter);
// router.use('/connections', connectionRouter);
router.use('/notifications', notificationRouter);

export default router;
