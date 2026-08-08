import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import * as crypto from 'crypto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`Register new user ${JSON.stringify(request)}`);

    const validatedRequest = this.validationService.validate(
      UserValidation.REGISTER,
      request,
    );

    const isUserExist = await this.prismaService.user.count({
      where: {
        username: validatedRequest.username,
      },
    });

    if (isUserExist !== 0) {
      throw new HttpException('User already exist', 400);
    }

    validatedRequest.password = await bcrypt.hash(
      validatedRequest.password,
      10,
    );

    const user = await this.prismaService.user.create({
      data: validatedRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`UserService.login(${JSON.stringify(request)})`);

    const validatedRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    let user = await this.prismaService.user.findUnique({
      where: {
        username: validatedRequest.username,
      },
    });

    if (!user) {
      throw new HttpException('Username or password is invalid', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      validatedRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Username or password is invalid', 401);
    }

    user = await this.prismaService.user.update({
      where: {
        username: validatedRequest.username,
      },
      data: {
        token: crypto.randomUUID(),
      },
    });

    return {
      name: user.name,
      username: user.username,
      token: user.token,
    };
  }

  async get(user: User): Promise<UserResponse> {
    return {
      name: user.name,
      username: user.username,
      token: user.token,
    };
  }
}
