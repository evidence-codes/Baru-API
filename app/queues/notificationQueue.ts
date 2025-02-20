// import Queue from 'bull';
// import { config } from '../config/config';
// import NotificationService from '../services/Notification.service';
// import { io } from '../server';
// import { NotificationType } from '../models/Notifications';
// import { Language, User } from '../models/User';
// import {
//   EmailTemplates,
//   INotificationContext,
//   sendMail,
//   Subjects,
// } from '../utils/email/emailHelper';
// // import ConnectionService from '../services/Connection.service';

// // Define notification queue
// const notificationQueue = new Queue<{
//   user: User;
//   type: NotificationType;
//   message: string;
//   meta_data?: string;
// }>('notificationQueue', {
//   redis: config.redis,
//   settings: {
//     lockDuration: 600000, // 10 minutes
//   },
// });

// // Define background notification types and cron schedules
// const bgRunNotifications = [
//   NotificationType.FRIENDS_IN_DANGER_ZONE,
//   NotificationType.FRIENDS_IN_APPLAUD_ZONE,
// ];
// const notificationCrons: { [key in NotificationType]?: string } = {
//   [NotificationType.FRIENDS_IN_APPLAUD_ZONE]: '0 */4 * * *', // every 4 hours
//   [NotificationType.FRIENDS_IN_DANGER_ZONE]: '0 */2 * * *', // every 2 hours
// };

// // Define notification functions for each type
// export const notificationFunctions = {
//   [NotificationType.SEND_GIFT]: ({
//     user,
//     context,
//   }: {
//     user: User;
//     context: INotificationContext;
//   }) => {
//     sendMail({
//       to: user.email,
//       subject: Subjects[NotificationType.SEND_GIFT][user.language as Language],
//       template: EmailTemplates.GIFTS?.[user.language as Language],
//       context: {
//         name: user.username,
//         link: context?.link ?? '',
//         email: user.email,
//         friendsName: context?.friendsName ?? '',
//         points: `${context?.points ?? '0'}pts`,
//       },
//     }).catch((error) => console.error('Error sending gift email:', error));
//   },

//   [NotificationType.CONNECTION_INVITATION]: ({
//     user,
//     context,
//   }: {
//     user: User;
//     context: INotificationContext;
//   }) => {
//     sendMail({
//       to: user.email,
//       subject:
//         Subjects[NotificationType.CONNECTION_INVITATION][
//           user.language as Language
//         ],
//       template: EmailTemplates.COMMUNITY_INVITE?.[user.language as Language],
//       context: {
//         name: user.username,
//         link: context?.link ?? '',
//         email: user.email,
//         friendsName: context?.friendsName ?? '',
//       },
//     }).catch((error) =>
//       console.error('Error sending connection invitation email:', error),
//     );
//   },

//   [NotificationType.CONNECTION_ACCEPTED]: ({
//     user,
//     context,
//   }: {
//     user: User;
//     context: INotificationContext;
//   }) => {
//     sendMail({
//       to: user.email,
//       subject:
//         Subjects[NotificationType.CONNECTION_ACCEPTED][
//           user.language as Language
//         ],
//       template: EmailTemplates.ACCEPT_INVITATION?.[user.language as Language],
//       context: {
//         name: user.username,
//         link: context?.link ?? '',
//         email: user.email,
//         friendsName: context?.friendsName ?? '',
//       },
//     }).catch((error) =>
//       console.error('Error sending connection acceptance email:', error),
//     );
//   },

//   [NotificationType.SEND_MOTIVATION]: ({
//     user,
//     context,
//   }: {
//     user: User;
//     context: INotificationContext;
//   }) => {
//     sendMail({
//       to: user.email,
//       subject:
//         Subjects[NotificationType.SEND_MOTIVATION][user.language as Language],
//       template: EmailTemplates.MOTIVATION?.[user.language as Language],
//       context: {
//         name: user.username,
//         link: context?.link ?? '',
//         email: user.email,
//         friendsName: context?.friendsName ?? '',
//       },
//     }).catch((error) =>
//       console.error('Error sending motivation email:', error),
//     );
//   },

//   [NotificationType.SEND_APPLAUD]: ({
//     user,
//     context,
//   }: {
//     user: User;
//     context: INotificationContext;
//   }) => {
//     sendMail({
//       to: user.email,
//       subject:
//         Subjects[NotificationType.SEND_APPLAUD][user.language as Language],
//       template: EmailTemplates.APPLAUD?.[user.language as Language],
//       context: {
//         name: user.username,
//         link: context?.link ?? '',
//         email: user.email,
//         friendsName: context?.friendsName ?? '',
//       },
//     }).catch((error) => console.error('Error sending applaud email:', error));
//   },

//   [NotificationType.NO_SCHEDULED_FRIENDS]: ({}: {}) => {},

//   [NotificationType.FRIENDS_IN_DANGER_ZONE]: ({
//     user,
//     context,
//   }: {
//     user: User;
//     context: INotificationContext;
//   }) => {
//     sendMail({
//       to: user.email,
//       subject:
//         Subjects[NotificationType.FRIENDS_IN_DANGER_ZONE][
//           user.language as Language
//         ],
//       template: EmailTemplates.DANGER_ZONE?.[user.language as Language],
//       context: {
//         name: user.username,
//         link: context?.link ?? '',
//         email: user.email,
//       },
//     }).catch((error) =>
//       console.error('Error sending danger zone email:', error),
//     );
//   },

//   [NotificationType.FRIENDS_IN_APPLAUD_ZONE]: ({
//     user,
//     context,
//   }: {
//     user: User;
//     context: INotificationContext;
//   }) => {
//     sendMail({
//       to: user.email,
//       subject:
//         Subjects[NotificationType.FRIENDS_IN_APPLAUD_ZONE][
//           user.language as Language
//         ],
//       template: EmailTemplates.APPLAUD_ZONE?.[user.language as Language],
//       context: {
//         name: user.username,
//         link: context?.link ?? '',
//         email: user.email,
//         friendsName: context?.friendsName ?? '',
//       },
//     }).catch((error) =>
//       console.error('Error sending applaud zone email:', error),
//     );
//   },
// };

// // Process notifications with different scheduling based on the type
// notificationQueue.process(async (job) => {
//   try {
//     const { user, type, message, meta_data } = job.data;

//     // if (bgRunNotifications.includes(type)) {
//     //   if (type === NotificationType.FRIENDS_IN_APPLAUD_ZONE) {
//     //     await processFriendsInApplaudZone(user);
//     //   } else {
//     //     await processFriendsInDangerZone(user);
//     //   }
//     //   return;
//     // }

//     // Save notification and send email
//     const notification = await NotificationService.createNotification(
//       user,
//       type,
//       message,
//       meta_data,
//     );
//     const parsedMetaData = JSON.parse(meta_data || '{}');
//     notificationFunctions[type]({
//       user,
//       context: {
//         link: parsedMetaData.link,
//         friendsName: parsedMetaData.friendsName,
//         points: parsedMetaData.points,
//       },
//     });

//     // Emit notification via WebSockets
//     io.to(user.id).emit('newNotification', notification);
//   } catch (error) {
//     console.error(`Error processing notification for job ${job.id}:`, error);
//   }
// });

// // Add notifications to the queue with scheduling logic for certain types
// export async function addNotificationToQueue({
//   user,
//   type,
//   message,
//   meta_data,
// }: {
//   user: User;
//   type: NotificationType;
//   message: string;
//   meta_data?: string;
// }) {
//   try {
//     // Check if the type is part of background-run notifications
//     if (bgRunNotifications.includes(type)) {
//       const cronSchedule = notificationCrons[type];

//       // Validate if a repeatable job already exists
//       const isJobScheduled = await isRepeatableJobScheduled(user.id, type);
//       if (isJobScheduled) {
//         console.log(
//           `Job already scheduled for user ${user.username} - ${type}`,
//         );
//         return;
//       }

//       // Add repeatable job to the queue
//       await notificationQueue.add(
//         { user, type, message, meta_data: meta_data || '' },
//         {
//           repeat: { cron: cronSchedule || '' },
//           jobId: `${user.id}-${type}`,
//         },
//       );
//     } else {
//       // Add a non-repeatable job to the queue
//       await notificationQueue.add({
//         user,
//         type,
//         message,
//         meta_data: meta_data ?? '',
//       });
//     }
//   } catch (error) {
//     console.error(
//       `Error scheduling notification for user ${user.username}:`,
//       error,
//     );
//   }
// }

// /**
//  * Checks if a repeatable job already exists for a given user and notification type.
//  */
// async function isRepeatableJobScheduled(
//   userId: string,
//   type: NotificationType,
// ): Promise<boolean> {
//   // Check for existing jobs in the queue
//   const scheduledJob = await notificationQueue.getJob(`${userId}-${type}`);
//   if (scheduledJob) return true;

//   // Check for repeatable jobs in the queue
//   const repeatableJobs = await notificationQueue.getRepeatableJobs();
//   return repeatableJobs.some((job) => job.key?.includes(userId));
// }

// // Helper function for friends in danger zone
// // async function processFriendsInDangerZone(user: User) {
// //   try {
// //     const friendsInDangerZoneCount =
// //       await ConnectionService.countConnectionsWithPointsBelow25Percent(
// //         user.id,
// //         user.timezone,
// //       );
// //     if (friendsInDangerZoneCount > 0) {
// //       notificationFunctions[NotificationType.FRIENDS_IN_DANGER_ZONE]({
// //         user,
// //         context: { link: `${config.clientUrl}` },
// //       });
// //     }
// //   } catch (error) {
// //     console.error(
// //       `Error processing danger zone friends for user ${user.username}:`,
// //       error,
// //     );
// //   }
// // }

// // Helper function for friends in applaud zone
// // async function processFriendsInApplaudZone(user: User) {
// //   try {
// //     const friendsInApplaudZoneCount =
// //       await ConnectionService.countConnectionsWithPointsAt100Percent(
// //         user.id,
// //         user.timezone,
// //       );
// //     if (friendsInApplaudZoneCount > 0) {
// //       notificationFunctions[NotificationType.FRIENDS_IN_APPLAUD_ZONE]({
// //         user,
// //         context: { link: `${config.clientUrl}` },
// //       });
// //     }
// //   } catch (error) {
// //     console.error(
// //       `Error processing applaud zone friends for user ${user.username}:`,
// //       error,
// //     );
// //   }
// // }

// export { notificationQueue };
