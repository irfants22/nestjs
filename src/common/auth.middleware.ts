import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'] as string;

    if (token) {
      const user = await this.prismaService.user.findFirst({
        where: {
          token,
        },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  }
}
