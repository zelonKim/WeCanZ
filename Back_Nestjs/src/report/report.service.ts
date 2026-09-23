import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 신고하기 (유저용)
  async createReport(reporterId: string, dto: CreateReportDto) {
    if (reporterId === dto.reportedUserId) {
      throw new BadRequestException('자신은 신고할 수 없습니다.');
    }

    // 동일 대상 중복 신고 여부 확인
    const existingReport = await this.prisma.report.findFirst({
      where: {
        reporterId,
        reportedUserId: dto.reportedUserId,
        reason: dto.reason,
      },
    });

    if (existingReport) {
      throw new BadRequestException('이미 신고한 내역이 존재합니다.');
    }

    // 신고 생성
    return await this.prisma.report.create({
      data: {
        reporterId,
        reportedUserId: dto.reportedUserId,
        reason: dto.reason,
        details: dto.details,
      },
    });
  }

  ////////////////////////////////////

  // 2. 대기중인 신고 목록 조회 (관리자용)
  async getPendingReports() {
    return await this.prisma.report.findMany({
      where: { status: 'PENDING' },
      include: {
        reporter: { select: { id: true, email: true, nickname: true } },
        reportedUser: { select: { id: true, email: true, nickname: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  ////////////////////////////////////

  // 3. 신고 상태 변경 (관리자용)
  async updateReportStatus(reportId: string, dto: UpdateReportStatusDto) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('해당 신고 건을 찾을 수 없습니다.');
    }

    return await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: dto.status,
      },
    });
  }
}
