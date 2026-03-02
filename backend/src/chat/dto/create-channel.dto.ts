import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum ChannelType {
  STOCK = 'stock',
  GENERAL = 'general',
  SECTOR = 'sector',
}

export class CreateChannelDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(ChannelType)
  channelType: ChannelType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  companyId?: string;
}
