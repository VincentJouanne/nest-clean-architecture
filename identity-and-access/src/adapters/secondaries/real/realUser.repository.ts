import { Email } from '@common/mail/domain/value-objects/email';
import { PrismaService } from '@common/prisma/adapters/prisma.service';
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
        const prismaUser = await this.prisma.user.findFirst({ where: { email: email } });
        if (prismaUser === null) {
          return null;
        }
        //TODO: Create a util to convert Persistence to Domain
        else
          return User.check({
            id: prismaUser.id,
            email: prismaUser.email,
            isVerified: prismaUser.is_verified,
            password: prismaUser.password,
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
            email: user.email,
            is_verified: user.isVerified,
            password: user.password,
          },
          create: {
            id: user.id,
            email: user.email,
            is_verified: user.isVerified,
            password: user.password,
          },
        });
        return;
      },
      (reason: unknown) => new InternalServerErrorException(),
    );
  };
}
