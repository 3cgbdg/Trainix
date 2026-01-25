import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import * as bcrypt from 'bcryptjs'
import { Prisma } from "generated/prisma/browser";
import { IReturnMessage } from "src/types/common";
import { UserProfile } from "src/types/profiles";


@Injectable()
export class ProfilesService {
    constructor(private readonly prisma: PrismaService) { }
    async getProfile(myId: string): Promise<UserProfile> {
        const profile = await this.prisma.user.findUnique({
            where: { id: myId },
            omit: { password: true },
            include: { metrics: true }
        })

        if (!profile) {
            throw new NotFoundException('User not found')
        }

        return profile
    }

    async deleteProfile(myId: string): Promise<IReturnMessage> {
        await this.prisma.user.delete({ where: { id: myId } });
        return ({ message: "Successfully deleted!" });

    }

    async updateProfile(myId: string, dto: UpdateProfileDto): Promise<IReturnMessage> {
        const profile = await this.prisma.user.findUnique({ where: { id: myId }, include: { metrics: true } });

        if (!profile) {
            throw new NotFoundException('User not found')
        };

        const { password, newPassword, newPasswordAgain, height, weight, ...userData } = dto
        const data: Prisma.UserUpdateInput = {
            ...userData
        }

        // checking for new password
        if (dto.password) {
            const isGood = await bcrypt.compare(dto.password, profile.password);
            if (!isGood) {
                throw new ForbiddenException("Password is incorrect!")
            }

            if (dto.newPassword && dto.newPassword === dto.newPasswordAgain) {
                const hashedPass = await bcrypt.hash(dto.newPassword, 10);
                data.password = hashedPass

            } else if (dto.newPassword || dto.newPasswordAgain) {
                throw new BadRequestException("Passwords do not match!")
            }
        }
        if (height !== undefined || weight !== undefined) {
            data.metrics = {
                update: {
                    ...(height !== undefined && { height }),
                    ...(weight !== undefined && { weight }),
                }
            }
        }

        await this.prisma.user.update({
            where: { id: myId },
            data,
            omit: { password: true },
        })

        return ({ message: "Successfully updated!" });
    }

}





