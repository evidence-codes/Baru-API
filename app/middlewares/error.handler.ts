import express from 'express';
import { AppError } from './appError';
// 404 - Not Found Middleware
export const notFound = (
  _req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  const error = new AppError('Page Not Found', 404);
  next(error);
};

// General Error Handling Middleware
export const generalError = (
  error: AppError,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  console.log({ error });
  const status = error.status || error.status || 500;

  let message = 'Internal Server Error';

  message = error.message || message;

  // Log the error for developer's insight
  console.error(`[${req.method} ${req.url}] ${message} `);
  if (error.status > 499) {
    console.log(`${error.stack}`);
  }

  // Respond with error
  res.status(status).json({
    success: false,
    message,
  });
};
