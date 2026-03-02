import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AddHoldingDto, UpdateHoldingDto } from './dto/add-holding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('portfolios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get()
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ANALYST, UserRole.ADMIN)
  async getUserPortfolios(@CurrentUser() user: any) {
    return this.portfolioService.getUserPortfolios(user.id || '1');
  }

  @Get(':id')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ANALYST, UserRole.ADMIN)
  async getPortfolio(@Param('id') id: string, @CurrentUser() user: any) {
    return this.portfolioService.getPortfolioById(id, user.id || '1');
  }

  @Get(':id/performance')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ANALYST, UserRole.ADMIN)
  async getPortfolioPerformance(@Param('id') id: string, @CurrentUser() user: any) {
    return this.portfolioService.getPortfolioPerformance(id, user.id || '1');
  }

  @Post()
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async createPortfolio(@Body() dto: CreatePortfolioDto, @CurrentUser() user: any) {
    return this.portfolioService.createPortfolio(user.id || '1', dto);
  }

  @Put(':id')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async updatePortfolio(
    @Param('id') id: string,
    @Body() dto: UpdatePortfolioDto,
    @CurrentUser() user: any,
  ) {
    return this.portfolioService.updatePortfolio(id, user.id || '1', dto);
  }

  @Delete(':id')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async deletePortfolio(@Param('id') id: string, @CurrentUser() user: any) {
    return this.portfolioService.deletePortfolio(id, user.id || '1');
  }

  @Post(':id/holdings')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async addHolding(
    @Param('id') id: string,
    @Body() dto: AddHoldingDto,
    @CurrentUser() user: any,
  ) {
    return this.portfolioService.addHolding(id, user.id || '1', dto);
  }

  @Put(':id/holdings/:holdingId')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async updateHolding(
    @Param('id') id: string,
    @Param('holdingId') holdingId: string,
    @Body() dto: UpdateHoldingDto,
    @CurrentUser() user: any,
  ) {
    return this.portfolioService.updateHolding(id, holdingId, user.id || '1', dto);
  }

  @Delete(':id/holdings/:holdingId')
  @Roles(UserRole.PORTFOLIO_MANAGER, UserRole.ADMIN)
  async removeHolding(
    @Param('id') id: string,
    @Param('holdingId') holdingId: string,
    @CurrentUser() user: any,
  ) {
    return this.portfolioService.removeHolding(id, holdingId, user.id || '1');
  }
}
