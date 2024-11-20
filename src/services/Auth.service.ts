import { Language, User } from '../models/User';
import { UserRepository } from '../ormconfig';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import {
  sendResetPasswordEmail,
  // resetPasswordMail,
  sendVerificationCodeEmail,
} from '../utils/email/emailHelper';
import { BadRequestError, NotFoundError } from '../utils/error';
import { otpQueue } from '../queues/otpQueue';
import { generateOTP } from '../utils/helpers';

class AuthService {
  async saveUser(data: Partial<User>): Promise<User> {
    return await UserRepository.save(data);
  }

  async requestPasswordReset(user: User): Promise<void> {
    const locale = user.language || 'en';

    const token = jwt.sign({ id: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.resetTokenExpiresIn,
    });

    const resetLink = `${config.clientUrl}/${locale}/change-password?token=${token}`;

    const body = {
      to: user.email,
      name: user.username,
      link: resetLink,
      language: locale as Language,
    };

    // resetPasswordMail(body).then(() => {});
    sendResetPasswordEmail(body).then(() => {});

    console.log('Reset password email sent successfully');
  }

  async resetPassword(user: User, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await UserRepository.save(user);
  }
  async getUserFromToken(token: string): Promise<User | null> {
    const decoded = jwt.verify(token, config.jwt.secret);

    if (typeof decoded === 'object' && decoded !== null) {
      const user = await UserRepository.findOneBy({ id: decoded.id });
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    }
    return null;
  }
  async getUserByEmailOrUsername(identifier: string): Promise<User | null> {
    const user = await UserRepository.findOneBy(
      identifier.includes('@')
        ? { email: identifier }
        : { username: identifier },
    );

    return user;
  }
  async getUserByEmail(email: string): Promise<User | null> {
    return await UserRepository.findOneBy({ email });
  }
  async getUserByUsername(username: string): Promise<User | null> {
    return await UserRepository.findOneBy({ username });
  }

  async getUserById(id: string): Promise<User | null> {
    return await UserRepository.findOneBy({ id });
  }

  async sendEmailVerification(user: User) {
    const verificationCode = await this.sendOtpToQueue(user.id);

    const body = {
      to: user.email,
      name: user.username,
      verificationCode,
      language: user.language as Language,
      link: `${config.clientUrl}/${user?.language}/login`,
    };

    await sendVerificationCodeEmail(body);
  }

  async sendOtpToQueue(userId: string) {
    const otp = generateOTP(6);

    await otpQueue.add({ userId, otp }, { delay: 30 * 60 * 1000 }); // 30 minutes

    return otp;
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const jobs = await otpQueue.getJobs(['waiting', 'delayed', 'active']);

    for (const job of jobs) {
      const { userId: jobUserId, otp: jobOtp } = job.data;
      if (jobUserId === userId && jobOtp === otp) {
        await job.remove();
        return true;
      }
    }

    return false;
  }

  async activateUser(userId: string): Promise<void> {
    const user = await UserRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestError('User not found');
    }

    user.isEmailVerified = true;
    await UserRepository.save(user);
  }
}

export default new AuthService();
