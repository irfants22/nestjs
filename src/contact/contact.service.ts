import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';

import { Contact, Prisma, User } from '@prisma/client';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { ContactValidation } from './contact.validation';
import { WebResponse } from '../model/web.model';
import { filter } from 'rxjs';

@Injectable()
export class ContactService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  toContactResponse(contact: Contact): ContactResponse {
    return {
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async create(
    user: User,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    const validatedRequest = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );

    const contact = await this.prismaService.contact.create({
      data: {
        ...validatedRequest,
        ...{ username: user.username },
      },
    });

    return this.toContactResponse(contact);
  }

  async get(user: User, contactId: number): Promise<ContactResponse> {
    const contact = await this.prismaService.contact.findFirst({
      where: {
        id: contactId,
        username: user.username,
      },
    });

    if (!contact) {
      throw new HttpException('Contact is not found', 404);
    }

    return this.toContactResponse(contact);
  }

  async update(
    user: User,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    const validatedRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    const isContactExist = await this.prismaService.contact.findFirst({
      where: {
        id: validatedRequest.id,
        username: user.username,
      },
    });

    if (!isContactExist) {
      throw new HttpException('Contact is not found', 404);
    }

    const contact = await this.prismaService.contact.update({
      where: { username: user.username, id: isContactExist.id },
      data: validatedRequest,
    });

    return this.toContactResponse(contact);
  }

  async delete(user: User, contactId: number): Promise<ContactResponse> {
    const isContactExist = await this.prismaService.contact.findFirst({
      where: {
        id: contactId,
        username: user.username,
      },
    });

    if (!isContactExist) {
      throw new HttpException('Contact is not found', 404);
    }

    const contact = await this.prismaService.contact.delete({
      where: {
        username: user.username,
        id: isContactExist.id,
      },
    });

    return this.toContactResponse(contact);
  }

  async search(
    user: User,
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const validatedRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filters: Prisma.ContactWhereInput[] = [];

    if (validatedRequest.name) {
      filters.push({
        OR: [
          { first_name: { contains: validatedRequest.name } },
          { last_name: { contains: validatedRequest.name } },
        ],
      });
    }

    if (validatedRequest.email) {
      filters.push({
        email: { contains: validatedRequest.email },
      });
    }

    if (validatedRequest.phone) {
      filters.push({
        phone: { contains: validatedRequest.phone },
      });
    }

    const skip = (validatedRequest.page - 1) * validatedRequest.size;

    const [contact, total] = await Promise.all([
      this.prismaService.contact.findMany({
        where: {
          username: user.username,
          AND: filters,
        },
        take: validatedRequest.size,
        skip,
      }),
      this.prismaService.contact.count({
        where: {
          username: user.username,
          AND: filters,
        },
      }),
    ]);

    return {
      data: contact.map((contact) => this.toContactResponse(contact)),
      paging: {
        current_page: validatedRequest.page,
        size: validatedRequest.size,
        total_page: Math.ceil(total / validatedRequest.size),
      },
    };
  }
}
