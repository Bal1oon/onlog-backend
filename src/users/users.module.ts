import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { PermanentDeleteUserService } from './permanent-delete-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, PermanentDeleteUserService],
  exports: [UserRepository],
})
export class UsersModule {}
