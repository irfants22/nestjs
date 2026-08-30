import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { AddressResponse, CreateAddressRequest } from '../model/address.model';
import { Address, User } from '@prisma/client';
import { AddressValidation } from './address.validation';

@Injectable()
export class AddressService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      postal_code: address.postal_code,
    };
  }

  async create(
    user: User,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    const validatedRequest = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );

    const isContactExist = await this.prismaService.contact.findFirst({
      where: {
        id: validatedRequest.contact_id,
        username: user.username,
      },
    });

    if (!isContactExist) {
      throw new HttpException('Contact is not found', 404);
    }

    const address = await this.prismaService.address.create({
      data: validatedRequest,
    });

    return this.toAddressResponse(address);
  }
}
