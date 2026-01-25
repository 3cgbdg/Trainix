import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from "@nestjs/common";
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

    @Get(":id")
    async getProfile(@Req() req: Request): Promise<UserProfile> {
        return this.profileService.getProfile((req as any).user.id);
    }
    @Delete(":id")
    async deleteProfile(@Req() req: Request): Promise<IReturnMessage> {
        return this.profileService.deleteProfile((req as any).user.id);
    }
    @Patch(":id")
    async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto): Promise<IReturnMessage> {
        return this.profileService.updateProfile((req as any).user.id, dto);
    }



}