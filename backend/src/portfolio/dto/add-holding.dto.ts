import { IsString, IsNumber, IsUUID, Min } from 'class-validator';

export class AddHoldingDto {
  @IsUUID()
  companyId: string;

  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @IsNumber()
  @Min(0.0001)
  averageBuyPrice: number;
}

export class UpdateHoldingDto {
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @IsNumber()
  @Min(0.0001)
  averageBuyPrice: number;
}
