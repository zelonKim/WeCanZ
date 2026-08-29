import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { CreateAdDto, UpdateAdDto } from './dto/ad.dto';

@Injectable()
export class CommercialService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== STORE SERVICE ====================

  async createStore(dto: CreateStoreDto) {
    return await this.prisma.store.create({
      data: {
        name: dto.name,
        address: dto.address,
        openTime: dto.openTime ?? '',
        closeTime: dto.closeTime ?? '',
        imageUrl: dto.imageUrl,
      },
    });
  }

  async findAllStores() {
    return await this.prisma.store.findMany({
      include: {
        ads: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneStore(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: { ads: true },
    });
    if (!store) {
      throw new NotFoundException(`해당 가게(ID: ${id})를 찾을 수 없습니다.`);
    }
    return store;
  }

  async updateStore(id: string, dto: UpdateStoreDto) {
    await this.findOneStore(id);
    return this.prisma.store.update({
      where: { id },
      data: dto,
    });
  }

  async removeStore(id: string) {
    await this.findOneStore(id);
    return this.prisma.store.delete({
      where: { id },
    });
  }

  // ==================== AD SERVICE ====================

  async createAd(dto: CreateAdDto) {
    await this.findOneStore(dto.storeId);

    return this.prisma.ad.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  // 어드민 관리용 전체 광고 조회
  async findAllAds() {
    return await this.prisma.ad.findMany({
      include: { store: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 앱 화면 제공용
  async findActiveAds() {
    const now = new Date();
    return await this.prisma.ad.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { store: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAd(id: string) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!ad) {
      throw new NotFoundException(`해당 광고(ID: ${id})를 찾을 수 없습니다.`);
    }
    return ad;
  }

  async updateAd(id: string, dto: UpdateAdDto) {
    await this.findOneAd(id);
    return this.prisma.ad.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  async removeAd(id: string) {
    await this.findOneAd(id);
    return this.prisma.ad.delete({
      where: { id },
    });
  }

  // 클릭 수 카운트 증가
  async incrementClickCount(id: string) {
    return await this.prisma.ad.update({
      where: { id },
      data: {
        clickCount: { increment: 1 },
      },
    });
  }
}
