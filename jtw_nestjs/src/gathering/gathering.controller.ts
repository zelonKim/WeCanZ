import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GatheringService } from './gathering.service';
import { CreateGatheringDto } from './dto/create-gathering.dto';
import { UpdateGatheringDto } from './dto/update-gathering.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { GetUser } from '../auth/decorators/get-user.decorator'; 
import type { User } from '@prisma/client';

@Controller('gathering')
export class GatheringController {
  constructor(private readonly gatheringService: GatheringService) {}

  // 1. 모임 생성
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser() user: User, @Body() createGatheringDto: CreateGatheringDto) {
    return this.gatheringService.create(user.id, createGatheringDto);
  }

  // 2. 전체 조회
  @Get()
  findAll() {
    return this.gatheringService.findAll();
  }

  // 3. 단일 상세 조회
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gatheringService.findOne(id);
  }

  // 4. 모임 수정 
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateGatheringDto: UpdateGatheringDto,
  ) {
    return this.gatheringService.update(id, user.id, updateGatheringDto);
  }

  // 5. 모임 삭제
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.gatheringService.remove(id, user.id);
  }
}