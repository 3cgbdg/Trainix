import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcryptjs'
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'generated/prisma/client';
import { OnBoardingAuthDto } from './dto/onboarding-auth.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService, private readonly configService: ConfigService) { };

    async signup(dto: CreateAuthDto): Promise<{ access_token: string, refresh_token: string }> {
        // hashing password
        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const user = await this.prisma.user.create({
            data: {
                firstName: dto.name, lastName: dto.surname, password: hashedPassword, email: dto.email, dateOfBirth: dto.dateOfBirth, gender: dto.gender
            }
        })
        if (!user) {
            throw new InternalServerErrorException();
        }

        const access_token = this.jwtService.sign({ userId: user.id });
        const refresh_token = this.jwtService.sign({ userId: user.id }, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d'
        },
        );
        return { access_token, refresh_token };
    }


    async login(dto: LoginAuthDto): Promise<{ access_token: string, refresh_token: string }> {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) {
            throw new NotFoundException();
        }
        const isGood = await bcrypt.compare(dto.password, user.password);
        if (!isGood) throw new InternalServerErrorException();
        const access_token = this.jwtService.sign({ userId: user.id });
        const refresh_token = this.jwtService.sign({ userId: user.id }, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d'
        },
        );

        return { access_token, refresh_token };
    }

    async onBoarding(myId: string, dto: OnBoardingAuthDto) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: myId } })
            if (!user) throw new NotFoundException("Failed to find a user")
            await this.prisma.user.update({
                where: { id: myId }, data: {
                    metrics: {
                        update: {
                            weight: dto.weight,
                            height: dto.height
                        }
                    },
                    targetWeight: dto.targetWeight,
                    primaryFitnessGoal: dto.primaryFitnessGoal,
                    fitnessLevel: dto.fitnessLevel,
                }
            })
            return { message: "Successfully on-boarding" };
        }
        catch {
            throw new InternalServerErrorException("Server error")
        }
    }

    async createTokenForRefresh(user: User): Promise<string> {
        return this.jwtService.sign({ userId: user.id })
    }
}
