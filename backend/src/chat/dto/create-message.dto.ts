import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  channelId: string;

  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsUUID()
  articleId?: string;
}
