import { ForbiddenException, HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req.cookies?.["access_token"],
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_SECRET")!,
        })
    }

    async validate(payload: any): Promise<unknown> {
        // later postgres db implementation
        const user = payload.id;
        if (!user) {
            throw new ForbiddenException("Failed to find a user")
        }
        return user;
    }

}