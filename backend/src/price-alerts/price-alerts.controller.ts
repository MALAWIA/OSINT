import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PriceAlertsService } from './price-alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PriceAlertsController {
  constructor(private priceAlertsService: PriceAlertsService) {}

  @Get()
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ANALYST, UserRole.ADMIN)
  async getUserAlerts(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.priceAlertsService.getUserAlerts(user.id || '1', status);
  }

  @Get('stats')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ANALYST, UserRole.ADMIN)
  async getAlertStats(@CurrentUser() user: any) {
    return this.priceAlertsService.getAlertStats(user.id || '1');
  }

  @Get('triggered')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ANALYST, UserRole.ADMIN)
  async getTriggeredAlerts(@CurrentUser() user: any) {
    return this.priceAlertsService.getTriggeredAlerts(user.id || '1');
  }

  @Get(':id')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ANALYST, UserRole.ADMIN)
  async getAlert(@Param('id') id: string, @CurrentUser() user: any) {
    return this.priceAlertsService.getAlertById(id, user.id || '1');
  }

  @Post()
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async createAlert(@Body() dto: CreateAlertDto, @CurrentUser() user: any) {
    return this.priceAlertsService.createAlert(user.id || '1', dto);
  }

  @Put(':id')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async updateAlert(
    @Param('id') id: string,
    @Body() dto: UpdateAlertDto,
    @CurrentUser() user: any,
  ) {
    return this.priceAlertsService.updateAlert(id, user.id || '1', dto);
  }

  @Put(':id/disable')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async disableAlert(@Param('id') id: string, @CurrentUser() user: any) {
    return this.priceAlertsService.disableAlert(id, user.id || '1');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async deleteAlert(@Param('id') id: string, @CurrentUser() user: any) {
    return this.priceAlertsService.deleteAlert(id, user.id || '1');
  }
}
