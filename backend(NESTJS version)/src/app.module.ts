import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { FitnessPlanModule } from './fitness-plan/fitness-plan.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule,
     FitnessPlanModule,
     ConfigModule.forRoot({
      isGlobal:true
     }),
     JwtModule.registerAsync({
      imports:[ConfigService],
      inject:[ConfigService],
      global:true,
      useFactory:(configService:ConfigService)=>({
        secret:configService.get<string>("JWT_SECRET"),
        signOptions:{expiresIn:"15m"}
      })
     })

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
