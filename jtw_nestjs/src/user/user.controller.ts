import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service'; // 같은 user 폴더 안에 있다면!
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // auth 모듈 경로에 맞게 수정!
import { GetUser } from '../auth/decorators/get-user.decorator'; // 커스텀 데코레이터 경로에 맞게!
import type { User } from '@prisma/client'; // 또는 유저 타입 경로에 맞게!
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user.id);
  }

  @Patch('profile')
  updateProfile(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Delete('account')
  deleteAccount(@GetUser() user: User) {
    return this.userService.deleteAccount(user.id);
  }   
}
