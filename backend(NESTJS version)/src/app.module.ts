import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FitnessPlanModule } from './fitness-plan/fitness-plan.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { NutritionPlanModule } from './nutrition-plan/nutrition-plan.module';
import { S3Module } from './utils/images/s3/s3module';
import { ImagesModule } from './utils/images/images.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [AuthModule,
    FitnessPlanModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    JwtModule.registerAsync({
      imports: [ConfigService],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "15m" }
      })
    }),
    S3Module,
    NotificationsModule,
    MeasurementsModule,
    NutritionPlanModule,
    ImagesModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        ttl: 0,
        tls: true,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        password: configService.get<string>('REDIS_PASSWORD') || null,
      }), 
    })

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
