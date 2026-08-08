import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { RegisterUserRequest, UserResponse } from '../model/user.model';

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
}
