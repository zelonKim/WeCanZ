import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { R2Provider } from 'utils/r2.provider';

@Module({
  controllers: [UserController],
  providers: [UserService, R2Provider],
})
export class UserModule {}
