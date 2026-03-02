import { IsNumber, IsOptional, IsBoolean, IsEnum, IsString, IsDateString, MaxLength } from 'class-validator';
import { AlertType, AlertStatus } from '../../common/entities/price-alert.entity';

export class UpdateAlertDto {
  @IsOptional()
  @IsEnum(AlertType)
  alertType?: AlertType;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

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
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
