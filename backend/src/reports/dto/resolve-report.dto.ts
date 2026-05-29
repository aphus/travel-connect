import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportStatus } from '../entities/report.entity';

export class ResolveReportDto {
  @IsIn([ReportStatus.RESOLVED, ReportStatus.REJECTED])
  status!: ReportStatus.RESOLVED | ReportStatus.REJECTED;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  admin_note?: string;
}
