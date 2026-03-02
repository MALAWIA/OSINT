import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { AlertType } from '../../common/entities/price-alert.entity';

export class CreateAlertDto {
  @IsUUID()
  companyId: string;

  @IsEnum(AlertType)
  alertType: AlertType;

  @IsNumber()
  targetValue: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsBoolean()
  notifyPush?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyInApp?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
