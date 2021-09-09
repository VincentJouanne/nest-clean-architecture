import { Email } from '@common/mail/domain/value-objects/email';
import { PrismaService } from '@common/prisma/adapters/prisma.service';
import { ContactInformations } from '@identity-and-access/domain/entities/contactInformations';
import { User } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class RealUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  getByEmail = (email: Email): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        const prismaUser = await this.prisma.user.findFirst({
          where: {
            contactInformations: {
              email: email,
            },
          },
          //We retrieve the whole aggregate root (user + its contact informations)
          include: {
            contactInformations: true,
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
            contactInformations: ContactInformations.check({
              email: prismaUser.contactInformations.email,
              verificationCode: prismaUser.contactInformations.verificationCode,
              isVerified: prismaUser.contactInformations.isVerified,
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
            contactInformations: {
              update: {
                email: user.contactInformations.email,
                verificationCode: user.contactInformations.verificationCode,
                isVerified: user.contactInformations.isVerified,
              },
            },
            password: user.password,
          },
          create: {
            id: user.id,
            password: user.password,
            contactInformations: {
              create: {
                email: user.contactInformations.email,
                verificationCode: user.contactInformations.verificationCode,
                isVerified: user.contactInformations.isVerified,
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
