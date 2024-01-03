import { ValidationError } from 'sequelize';
import { BadRequestException, HttpException } from '@nestjs/common';

export default function throwHttpException(error: object | any, status: number) {
  if (error instanceof ValidationError) {
    throw new BadRequestException(error.errors.map(err => err.message));
  }
  if (error instanceof HttpException) {
    throw error;
  }
  throw new HttpException(HttpException.createBody(error), status);
}
