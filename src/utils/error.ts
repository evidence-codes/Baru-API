import { ReasonPhrases, StatusCodes } from 'http-status-codes';

export class CustomError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);

    this.status = status;
  }
}
export class MongoError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string = ReasonPhrases.BAD_REQUEST) {
    super(message, StatusCodes.BAD_REQUEST);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = ReasonPhrases.UNAUTHORIZED) {
    super(message, StatusCodes.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = ReasonPhrases.NOT_FOUND) {
    super(message, StatusCodes.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = ReasonPhrases.INTERNAL_SERVER_ERROR) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
    this.name = 'InternalServerError';
  }
}
