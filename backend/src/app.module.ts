import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CompaniesModule } from './companies/companies.module';
import { NewsModule } from './news/news.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ModerationModule } from './moderation/moderation.module';
import { HealthModule } from './common/health/health.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { StockPricesModule } from './stock-prices/stock-prices.module';
import { PriceAlertsModule } from './price-alerts/price-alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     url: configService.get('DATABASE_URL'),
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
    //     logging: configService.get('NODE_ENV') === 'development',
    //   }),
    //   inject: [ConfigService],
    // }),
    
    // Core modules
    AuthModule,
    ChatModule,
    CompaniesModule,
    NewsModule,
    NotificationsModule,
    ModerationModule,
    HealthModule,

    // NSE-CT modules
    PortfolioModule,
    StockPricesModule,
    PriceAlertsModule,
  ],
})
export class AppModule {}
