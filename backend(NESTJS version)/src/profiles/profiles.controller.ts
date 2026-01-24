import { Body, Controller, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProfilesService } from "./profiles.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import type { Request } from "express";
import { UserProfile } from "src/types/profiles";
import { IReturnMessage } from "src/types/common";

@UseGuards(AuthGuard("jwt"))
@Controller("profiles")
export class ProfilesController {
    constructor(private readonly profileService: ProfilesService) { }

    async getProfile(@Req() req: Request): Promise<UserProfile | null> {
        return this.profileService.getProfile((req as any).user.id);
    }

    async deleteProfile(@Req() req: Request): Promise<IReturnMessage | null> {
        return this.profileService.deleteProfile((req as any).user.id);
    }

    async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto): Promise<IReturnMessage | null> {
        return this.profileService.updateProfile((req as any).user.id, dto);
    }



}