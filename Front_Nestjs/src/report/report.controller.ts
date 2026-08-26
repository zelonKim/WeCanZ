import { Controller, Post, Get, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 사용 중인 AuthGuard
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UpdateReportStatusDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // 1. 신고하기 (유저용)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createReport(@GetUser('id') reporterId, @Body() dto: CreateReportDto) {
    const report = await this.reportService.createReport(reporterId, dto);

    return {
      success: true,
      message: '신고가 성공적으로 접수되었습니다.',
      data: report,
    };
  }

  // 2. 대기 중인 신고 목록 조회 (관리자용)
  @UseGuards(JwtAuthGuard) 
  @Get('pending')
  async getPendingReports() {
    const reports = await this.reportService.getPendingReports();
    return {
      success: true,
      data: reports,
    };
  }

  // 3. 신고 상태 변경 (관리자용)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateReportStatus(
    @Param('id') reportId: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    const updatedReport = await this.reportService.updateReportStatus(reportId, dto);

    return {
      success: true,
      message: `신고 상태가 ${dto.status}(으)로 변경되었습니다.`,
      data: updatedReport,
    };
  }
}
