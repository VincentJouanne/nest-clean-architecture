import { PrismaService } from '@common/prisma/adapters/prisma.service';
import { User, UserId } from '@identity-and-access/domain/entities/user';
import { ContactInformation } from '@identity-and-access/domain/value-objects/contactInformation';
import { UserRepository } from '@identity-and-access/infrastructure/ports/user.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Email } from '@notifications/domain/value-objects/email';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class RealUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) { }

  getById = (userId: UserId): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        const prismaUser = await this.prisma.user.findUnique({
          where: {
            id: userId
          },
          //We retrieve the whole aggregate root (user + its contact informations)
          include: {
            contactInformation: true,
          },
        });

        if (prismaUser === null) {
          return null;
        }
        //TODO: Create a util to convert Persistence to Domain
        else
          return User.check({
            id: prismaUser.id,
            password: prismaUser.password,
            contactInformation: ContactInformation.check({
              email: prismaUser.contactInformation.email,
              verificationCode: prismaUser.contactInformation.verificationCode,
              isVerified: prismaUser.contactInformation.isVerified,
            }),
          });
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  }

  getByEmail = (email: Email): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        const prismaUser = await this.prisma.user.findFirst({
          where: {
            contactInformation: {
              email: email,
            },
          },
          //We retrieve the whole aggregate root (user + its contact informations)
          include: {
            contactInformation: true,
          },
        });

        if (prismaUser === null) {
          return null;
        }
        //TODO: Create a util to convert Persistence to Domain
        else
          return User.check({
            id: prismaUser.id,
            password: prismaUser.password,
            contactInformation: ContactInformation.check({
              email: prismaUser.contactInformation.email,
              verificationCode: prismaUser.contactInformation.verificationCode,
              isVerified: prismaUser.contactInformation.isVerified,
            }),
          });
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        await this.prisma.user.upsert({
          where: {
            id: user.id,
          },
          update: {
            contactInformation: {
              update: {
                email: user.contactInformation.email,
                verificationCode: user.contactInformation.verificationCode,
                isVerified: user.contactInformation.isVerified,
              },
            },
            password: user.password,
          },
          create: {
            id: user.id,
            password: user.password,
            contactInformation: {
              create: {
                email: user.contactInformation.email,
                verificationCode: user.contactInformation.verificationCode,
                isVerified: user.contactInformation.isVerified,
              },
            },
          },
        });
        return;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
