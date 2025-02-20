import dotenv from 'dotenv';
dotenv.config();

export function getEnvValue(key: string, isRequired = true): string {
  const value = process.env[key];
  if (!value && isRequired) {
    throw new Error(`Env variable ${key} not found`);
  }
  return value as string;
}
export const config = {
  jwt: {
    secret: getEnvValue('JWT_SECRET'),
    expiresIn: getEnvValue('JWT_SECRET_EXPIRE'),
    refreshTokenExpiresIn: getEnvValue('JWT_REFRESH_SECRET_EXPIRE'),
    resetTokenExpiresIn: getEnvValue('JWT_RESET_SECRET_EXPIRE'),
  },
  port: getEnvValue('PORT', false),
  cloudinary: {
    cloud_name: getEnvValue('CLOUDINARY_CLOUD_NAME'),
    api_key: getEnvValue('CLOUDINARY_API_KEY'),
    api_secret: getEnvValue('CLOUDINARY_API_SECRET'),
  },
  db: {
    // username: getEnvValue('DB_USERNAME'),
    // password: getEnvValue('DB_PASSWORD'),
    // host: getEnvValue('DB_HOST'),
    // port: getEnvValue('DB_PORT'),
    // database: getEnvValue('DB_NAME'),
    uri: getEnvValue('DB_URI'),
  },
  redis: {
    host: getEnvValue('REDIS_HOST'),
    port: Number(getEnvValue('REDIS_PORT')),
    password: getEnvValue('REDIS_PASSWORD'),
    retryStrategy: (times: number) => Math.min(times * 50, 2000), // Retry with backoff
  },
  // mailgun: {
  //   api_key: getEnvValue('MAILGUN_API_KEY'),
  //   domain: getEnvValue('MAILGUN_DOMAIN'),
  //   sender_name: getEnvValue('MAILGUN_SENDER_NAME'),
  //   sender_email: getEnvValue('MAILGUN_SENDER_EMAIL'),
  // },
  clientUrl: getEnvValue('CLIENT_URL'),
  smtp: {
    host: getEnvValue('SMTP_HOST'),
    port: getEnvValue('SMTP_PORT'),
    username: getEnvValue('SMTP_USERNAME'),
    password: getEnvValue('SMTP_PASSWORD'),
    sender_name: getEnvValue('SMTP_SENDER_NAME'),
  },
};
