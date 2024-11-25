import { config } from '../../config/config';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import nodemailer from 'nodemailer';
// import { Session } from '../../models/Session';
import { Language } from '../../models/User';
import { NotificationType } from '../../models/Notifications';

const sender = `${config.smtp.sender_name} <${config.smtp.username}>`;

export const Subjects = {
  ACCOUNT_DELETION: 'Account Deletion',
  FORGOT_PASSWORD: 'Forgot Password',
  PASSWORD_CHANGE: 'Password Change',
  RESET_PASSWORD: 'Reset Password',
  VERIFICATION_MAIL: 'Email Verification',
  WELCOME: 'Welcome to BARU',
} as const;
export const EmailTemplates = {
  DELETE_ACCOUNT: 'delete-account-en',
  FORGOT_PASSWORD: 'forgot-password',
  PASSWORD_CHANGE: 'password-change-en',
  RESET_PASSWORD: 'reset-password-en',
  VERIFICATION_MAIL: 'verification-mail-en',
  WELCOME: 'welcome-en',
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
  link,
}: {
  to: string;
  name: string;
  link: string;
}) {
  return sendMail({
    to,
    subject: Subjects['WELCOME'],
    template: EmailTemplates['WELCOME'],
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
}: {
  to: string;
  name: string;
  verificationCode: string;
}) {
  return sendMail({
    to,
    subject: Subjects['VERIFICATION_MAIL'],
    template: EmailTemplates['VERIFICATION_MAIL'],
    context: { name, verificationCode, email: to },
  }).catch((error) => {
    console.error('Error sending verification code email:', error);
  });
}

export async function sendResetPasswordEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  return sendMail({
    to,
    subject: Subjects['RESET_PASSWORD'],
    template: EmailTemplates['RESET_PASSWORD'],
    context: { name, email: to },
  }).catch((error) => {
    console.error('Error sending reset password email:', error);
  });
}
