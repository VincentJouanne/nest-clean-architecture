import { Email } from '@common/mail/domain/value-objects/email';
import { PrismaService } from '@common/prisma/adapters/prisma.service';
import { User } from '@identity-and-access/domain/entities/user';
import { UserRepository } from '@identity-and-access/domain/repositories/user.repository';
import { Injectable } from '@nestjs/common';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

@Injectable()
export class RealUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  getByEmail = (email: Email): TaskEither<Error, User | null> => {
    return tryCatch(
      async () => {
        const prismaUser = await this.prisma.user.findFirst({ where: { email: email } });
        console.log('PRISMA USER', prismaUser);
        if (prismaUser === null) {
          return null;
        }
        //TODO: Create a util to convert Persistence to Domain
        else
          return User.check({
            id: prismaUser.id,
            email: prismaUser.email,
            isVerified: prismaUser.is_verified_email,
            password: prismaUser.password,
          });
      },
      (error: Error) => error,
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
            is_verified_email: user.isVerified,
            password: user.password,
          },
          create: {
            id: user.id,
            email: user.email,
            is_verified_email: user.isVerified,
            password: user.password,
          },
        });
        return;
      },
      (error: Error) => error,
    );
  };

  all = (): TaskEither<Error, User[]> => {
    return tryCatch(
      async () => {
        return [];
      },
      (error: Error) => error,
    );
  };
}
