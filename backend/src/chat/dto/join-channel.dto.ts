import { IsString, IsOptional, IsEnum } from 'class-validator';

export class JoinChannelDto {
  @IsString()
  channelId: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(['stock', 'general', 'sector'])
  channelType?: 'stock' | 'general' | 'sector';
}
