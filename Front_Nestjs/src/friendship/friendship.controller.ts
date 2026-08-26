import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator'; // 커스텀 데코레이터 경로

@Controller('friendship')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  // 1. 친구 신청 보내기
  @Post('request/:receiverId')
  sendFriendRequest(
    @GetUser('id') senderId: string, 
    @Param('receiverId') receiverId: string,
  ) {
    return this.friendshipService.sendFriendRequest(senderId, receiverId);
  }

  // 2. 친구 신청 수락
  @Patch(':id/accept')
  acceptFriendRequest(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.friendshipService.acceptFriendRequest(id, userId);
  }

  // 3. 친구 신청 거절
  @Patch(':id/reject')
  rejectFriendRequest(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.friendshipService.rejectFriendRequest(id, userId);
  }

  // 4. 내 친구 목록 조회
  @Get()
  getMyFriends(@GetUser('id') userId: string) {
    return this.friendshipService.getMyFriends(userId);
  }

  // 5. 받은 친구 요청 목록 조회
  @Get('requests/pending')
  getPendingRequests(@GetUser('id') userId: string) {
    return this.friendshipService.getPendingRequests(userId);
  }

  // 6. 친구 차단
  @Patch('block/:targetUserId')
  blockFriend(
    @GetUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.friendshipService.blockFriend(targetUserId, userId);
  }

  // 7. 차단 해제
  @Patch('unblock/:targetUserId')
  unblockFriend(
    @GetUser('id') userId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.friendshipService.unblockFriend(targetUserId, userId);
  }

  // 8. 내가 차단한 유저 목록 조회
  @Get('blocked')
  getBlockedUsers(@GetUser('id') userId: string) {
    return this.friendshipService.getBlockedUsers(userId);
  }
}
