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

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
