import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  AddressResponse,
  CreateAddressRequest,
  DeleteAddressRequest,
  GetAddressRequest,
  UpdateAddressRequest,
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

  async checkAddressMustExist(
    addressId: number,
    contactId: number,
  ): Promise<Address> {
    const address = await this.prismaService.address.findFirst({
      where: {
        id: addressId,
        contact_id: contactId,
      },
    });

    if (!address) {
      throw new HttpException('Address not found', 404);
    }

    return address;
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

    const address = await this.checkAddressMustExist(
      validatedRequest.address_id,
      validatedRequest.contact_id,
    );

    return this.toAddressResponse(address);
  }

  async update(
    user: User,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    const validatedRequest = this.validationService.validate(
      AddressValidation.UPDATE,
      request,
    );

    await this.contactService.checkContactMustExist(
      validatedRequest.contact_id,
      user.username,
    );

    let address = await this.checkAddressMustExist(
      validatedRequest.address_id,
      validatedRequest.contact_id,
    );

    address = await this.prismaService.address.update({
      where: {
        id: address.id,
        contact_id: address.contact_id,
      },
      data: {
        street: address.street,
        city: address.city,
        province: address.province,
        country: address.country,
        postal_code: address.postal_code,
      },
    });

    return this.toAddressResponse(address);
  }

  async delete(
    user: User,
    request: DeleteAddressRequest,
  ): Promise<AddressResponse> {
    const validatedRequest = this.validationService.validate(
      AddressValidation.DELETE,
      request,
    );

    await this.contactService.checkContactMustExist(
      validatedRequest.contact_id,
      user.username,
    );

    const address = await this.checkAddressMustExist(
      validatedRequest.address_id,
      validatedRequest.contact_id,
    );

    return await this.prismaService.address.delete({
      where: {
        id: address.id,
        contact_id: address.contact_id,
      },
    });
  }
}
