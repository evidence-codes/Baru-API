import { config } from '../../config/config';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import nodemailer from 'nodemailer';
// import { Session } from '../../models/Session';
import { Language } from '../../models/User';
import { NotificationType } from '../../models/Notifications';

const sender = `${config.smtp.sender_name} <${config.smtp.username}>`;

export const Subjects = {
  [NotificationType.SEND_GIFT]: {
    [Language.ENGLISH]: 'Gifts Request',
    [Language.UKRAINIAN]: 'Запит на подарунок',
    [Language.GERMAN]: 'Geschenkanfrage',
  },
  [NotificationType.CONNECTION_INVITATION]: {
    [Language.ENGLISH]: 'Connection Invitation',
    [Language.UKRAINIAN]: 'Запрошення до зв’язку',
    [Language.GERMAN]: 'Verbindungseinladung',
  },
  [NotificationType.CONNECTION_ACCEPTED]: {
    [Language.ENGLISH]: 'Connection Accepted',
    [Language.UKRAINIAN]: 'Зв’язок прийнято',
    [Language.GERMAN]: 'Verbindung akzeptiert',
  },
  [NotificationType.SEND_MOTIVATION]: {
    [Language.ENGLISH]: 'Motivation',
    [Language.UKRAINIAN]: 'Мотивація',
    [Language.GERMAN]: 'Motivation',
  },
  [NotificationType.SEND_APPLAUD]: {
    [Language.ENGLISH]: 'Applaud',
    [Language.UKRAINIAN]: 'Оплески',
    [Language.GERMAN]: 'Applaudieren',
  },
  [NotificationType.NO_SCHEDULED_FRIENDS]: {
    [Language.ENGLISH]: 'No Scheduled Friends',
    [Language.UKRAINIAN]: 'Немає запланованих друзів',
    [Language.GERMAN]: 'Keine geplanten Freunde',
  },
  [NotificationType.FRIENDS_IN_DANGER_ZONE]: {
    [Language.ENGLISH]: 'Friends in Danger Zone',
    [Language.UKRAINIAN]: 'Друзі в зоні ризику',
    [Language.GERMAN]: 'Freunde in der Gefahrenzone',
  },
  [NotificationType.FRIENDS_IN_APPLAUD_ZONE]: {
    [Language.ENGLISH]: 'Friends in Applaud Zone',
    [Language.UKRAINIAN]: 'Друзі у зоні оплесків',
    [Language.GERMAN]: 'Freunde in der Applaus-Zone',
  },
  ACCOUNT_DELETION: {
    [Language.ENGLISH]: 'Account Deletion',
    [Language.UKRAINIAN]: 'Видалення облікового запису',
    [Language.GERMAN]: 'Kontolöschung',
  },
  FORGOT_PASSWORD: {
    [Language.ENGLISH]: 'Forgot Password',
    [Language.UKRAINIAN]: 'Забули пароль',
    [Language.GERMAN]: 'Passwort vergessen',
  },
  PASSWORD_CHANGE: {
    [Language.ENGLISH]: 'Password Change',
    [Language.UKRAINIAN]: 'Зміна пароля',
    [Language.GERMAN]: 'Passwortänderung',
  },
  RESET_PASSWORD: {
    [Language.ENGLISH]: 'Reset Password',
    [Language.UKRAINIAN]: 'Скинути пароль',
    [Language.GERMAN]: 'Passwort zurücksetzen',
  },
  SCHEDULE_REMINDER: {
    [Language.ENGLISH]: 'Schedule Reminder',
    [Language.UKRAINIAN]: 'Нагадування про розклад',
    [Language.GERMAN]: 'Termin Erinnerung',
  },
  VERIFICATION_MAIL: {
    [Language.ENGLISH]: 'Email Verification',
    [Language.UKRAINIAN]: 'Перевірка електронної пошти',
    [Language.GERMAN]: 'E-Mail-Verifizierung',
  },
  WELCOME: {
    [Language.ENGLISH]: 'Welcome to Hisown',
    [Language.UKRAINIAN]: 'Ласкаво просимо до Hisown',
    [Language.GERMAN]: 'Willkommen bei Hisown',
  },
} as const;
export const EmailTemplates = {
  ACCEPT_INVITATION: {
    [Language.GERMAN]: 'accept-invitation-de',
    [Language.ENGLISH]: 'accept-invitation-en',
    [Language.UKRAINIAN]: 'accept-invitation-uk',
  },
  APPLAUD: {
    [Language.GERMAN]: 'applaud-de',
    [Language.ENGLISH]: 'applaud-en',
    [Language.UKRAINIAN]: 'applaud-uk',
  },
  APPLAUD_ZONE: {
    [Language.GERMAN]: 'applaud-zone-de',
    [Language.ENGLISH]: 'applaud-zone-en',
    [Language.UKRAINIAN]: 'applaud-zone-uk',
  },
  COMMUNITY_INVITE: {
    [Language.GERMAN]: 'community-invite-de',
    [Language.ENGLISH]: 'community-invite-en',
    [Language.UKRAINIAN]: 'community-invite-uk',
  },
  DANGER_ZONE: {
    [Language.GERMAN]: 'danger-zone-de',
    [Language.ENGLISH]: 'danger-zone-en',
    [Language.UKRAINIAN]: 'danger-zone-uk',
  },
  DELETE_ACCOUNT: {
    [Language.GERMAN]: 'delete-account-de',
    [Language.ENGLISH]: 'delete-account-en',
    [Language.UKRAINIAN]: 'delete-account-uk',
  },
  FORGOT_PASSWORD: 'forgot-password',
  GIFTS: {
    [Language.GERMAN]: 'gifts-de',
    [Language.ENGLISH]: 'gifts-en',
    [Language.UKRAINIAN]: 'gifts-uk',
  },
  MOTIVATION: {
    [Language.GERMAN]: 'motivation-de',
    [Language.ENGLISH]: 'motivation-en',
    [Language.UKRAINIAN]: 'motivation-uk',
  },
  NO_SCHEDULE: {
    [Language.GERMAN]: 'no-schedule-de',
    [Language.ENGLISH]: 'no-schedule-en',
    [Language.UKRAINIAN]: 'no-schedule-uk',
  },
  PASSWORD_CHANGE: {
    [Language.GERMAN]: 'password-change-de',
    [Language.ENGLISH]: 'password-change-en',
    [Language.UKRAINIAN]: 'password-change-uk',
  },
  RESET_PASSWORD: {
    [Language.GERMAN]: 'reset-password-de',
    [Language.ENGLISH]: 'reset-password-en',
    [Language.UKRAINIAN]: 'reset-password-uk',
  },
  SCHEDULE_REMINDER: {
    [Language.GERMAN]: 'schedule-reminder-de',
    [Language.ENGLISH]: 'schedule-reminder-en',
    [Language.UKRAINIAN]: 'schedule-reminder-uk',
  },
  VERIFICATION_MAIL: {
    [Language.GERMAN]: 'verification-mail-de',
    [Language.ENGLISH]: 'verification-mail-en',
    [Language.UKRAINIAN]: 'verification-mail-uk',
  },
  WELCOME: {
    [Language.GERMAN]: 'welcome-de',
    [Language.ENGLISH]: 'welcome-en',
    [Language.UKRAINIAN]: 'welcome-uk',
  },
} as const;

// Configure nodemailer transport
const smtpTransport = nodemailer.createTransport({
  host: config.smtp.host,
  port: parseInt(config.smtp.port!, 10),
  secure: true, // Use true for port 465, false for other ports
  auth: {
    user: config.smtp.username,
    pass: config.smtp.password,
  },
});

// Configure Handlebars as the email template engine
smtpTransport.use(
  'compile',
  hbs({
    viewEngine: {
      partialsDir: path.resolve('./templates'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./templates'),
    extName: '.hbs',
  }),
);

export interface INotificationContext {
  link?: string;
  friendsName?: string;
  points?: string;
}
export interface IContext
  extends INotificationContext,
    Record<string, unknown> {
  name: string;
  email: string;

  sessionDate?: string;
  sessionTime?: string;
  sessionTitle?: string;
  sessionType?: string;
}

interface EmailData {
  to: string;
  subject: string;
  template: string;
  context: IContext;
}

// Generic function to send an email using the provided template and context
export async function sendMail({ to, subject, template, context }: EmailData) {
  try {
    const message = {
      from: sender,
      to,
      subject,
      template,
      context,
    };

    const info = await smtpTransport.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
}

// Function to send a welcome email
export async function sendWelcomeEmail({
  to,
  name,
  language = Language.ENGLISH,
  link,
}: {
  to: string;
  name: string;
  language: Language;
  link: string;
}) {
  return sendMail({
    to,
    subject: Subjects['WELCOME'][language],
    template: EmailTemplates['WELCOME'][language],
    context: { name, email: to, link },
  }).catch((error) => {
    console.error('Error sending welcome email:', error);
  });
}

// Function to send a verification code email
export async function sendVerificationCodeEmail({
  to,
  name,
  verificationCode,
  language = Language.ENGLISH,
}: {
  to: string;
  name: string;
  verificationCode: string;
  language: Language;
}) {
  return sendMail({
    to,
    subject: Subjects['VERIFICATION_MAIL'][language],
    template: EmailTemplates['VERIFICATION_MAIL'][language],
    context: { name, verificationCode, email: to },
  }).catch((error) => {
    console.error('Error sending verification code email:', error);
  });
}

export async function sendResetPasswordEmail({
  to,
  name,
  link,
  language = Language.ENGLISH,
}: {
  to: string;
  name: string;
  link: string;
  language: Language;
}) {
  return sendMail({
    to,
    subject: Subjects['RESET_PASSWORD'][language],
    template: EmailTemplates['RESET_PASSWORD'][language],
    context: { name, link, email: to },
  }).catch((error) => {
    console.error('Error sending reset password email:', error);
  });
}
