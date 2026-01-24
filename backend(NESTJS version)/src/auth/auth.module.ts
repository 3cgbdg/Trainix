import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/strategies/jwt-strategy';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],

})
export class AuthModule { }
