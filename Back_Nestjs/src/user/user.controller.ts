import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { GetUser } from '../auth/decorators/get-user.decorator'; 
import type { User } from '@prisma/client'; 
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import 'multer';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 1. 내 정보 조회
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.userService.getMe(user.id);
  }

  // 2. 프로필 수정
  @Patch('profile')
  updateProfile(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(user.id, dto);
  }

  // 3. 회원 탈퇴
  @Delete('account')
  deleteAccount(@GetUser() user: User) {
    return this.userService.deleteAccount(user.id);
  }

  // 4. 닉네임으로 유저 찾기
  @Get('search/:nickname')
  async searchUserByNickname(@Param('nickname') nickname: string) {
    return await this.userService.findByNickname(nickname);
  }

  // 5. 프로필 이미지 업로드
  @Post('profile-image')
  @UseInterceptors(FileInterceptor('profile_image'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('업로드할 이미지 파일이 없습니다.');
    }

    const userId = req.user?.id || 'temp-user-id';

    const imageUrl = await this.userService.uploadProfileImage(userId, file);

    return {
      success: true,
      imageUrl,
    };
  }

  // 6. 특정 유저 프로필 조회
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return await this.userService.getUserProfile(id);
  }

  // 7. 유저 푸시 토큰 저장
  @Patch('push-token')
  async updatePushToken(
    @GetUser() user: User,
    @Body('pushToken') pushToken: string,
  ) {
    return this.userService.updatePushToken(user.id, pushToken);
  }

  // 8. 유저 푸시 토큰 삭제
  @Delete('push-token')
  async deletePushToken(@GetUser() user: User) {
    return await this.userService.deletePushToken(user.id);
  }
}
