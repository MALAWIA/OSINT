import { IsOptional, IsString, IsDateString, IsNumber, IsIn } from 'class-validator';

export class QueryStockPricesDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  ticker?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1d', '5d', '1m', '3m', '6m', '1y', 'ytd', 'all'])
  range?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1min', '5min', '15min', '1h', '1d', '1w', '1M'])
  interval?: string;
}
