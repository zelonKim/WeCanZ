import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommercialService } from './commercial.service';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Controller('commercial')
export class CommercialController {
  constructor(private readonly commercialService: CommercialService) {}

  // ==================== STORE (가게 API) ====================

  @Post('stores')
  createStore(@Body() createStoreDto: CreateStoreDto) {
    return this.commercialService.createStore(createStoreDto);
  }

  @Get('stores')
  findAllStores() {
    return this.commercialService.findAllStores();
  }

  @Get('stores/:id')
  findOneStore(@Param('id') id: string) {
    return this.commercialService.findOneStore(id);
  }

  @Patch('stores/:id')
  updateStore(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.commercialService.updateStore(id, updateStoreDto);
  }

  @Delete('stores/:id')
  removeStore(@Param('id') id: string) {
    return this.commercialService.removeStore(id);
  }

  // ==================== AD (광고 API) ====================

  @Post('ads')
  createAd(@Body() createAdDto: CreateAdDto) {
    return this.commercialService.createAd(createAdDto);
  }

  // 유저 앱 화면용 (현재 활성화된 광고만 조회)
  @Get('ads')
  findActiveAds() {
    return this.commercialService.findActiveAds();
  }

  @Get('ads/:id')
  findOneAd(@Param('id') id: string) {
    return this.commercialService.findOneAd(id);
  }

  @Patch('ads/:id')
  updateAd(@Param('id') id: string, @Body() updateAdDto: UpdateAdDto) {
    return this.commercialService.updateAd(id, updateAdDto);
  }

  @Delete('ads/:id')
  removeAd(@Param('id') id: string) {
    return this.commercialService.removeAd(id);
  }

  // 광고 클릭 수 증가
  @Post('ads/:id/click')
  clickAd(@Param('id') id: string) {
    return this.commercialService.incrementClickCount(id);
  }
  // 어드민용 (모든 광고 목록 조회)
  @Get('ads/all')
  findAllAds() {
    return this.commercialService.findAllAds();
  }
}
