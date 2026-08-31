import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
} from '../model/address.model';
import { Address, User } from '@prisma/client';
import { AddressValidation } from './address.validation';
import { ContactService } from '../contact/contact.service';

@Injectable()
export class AddressService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
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

    await this.contactService.checkContactMustExist(
      validatedRequest.contact_id,
      user.username,
    );

    const address = await this.prismaService.address.create({
      data: validatedRequest,
    });

    return this.toAddressResponse(address);
  }

  async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
    const validatedRequest = this.validationService.validate(
      AddressValidation.GET,
      request,
    );

    await this.contactService.checkContactMustExist(
      validatedRequest.contact_id,
      user.username,
    );

    const address = await this.prismaService.address.findFirst({
      where: {
        id: validatedRequest.address_id,
        contact_id: validatedRequest.contact_id,
      },
    });

    if (!address) {
      throw new HttpException('Address not found', 404);
    }

    return this.toAddressResponse(address);
  }
}
