
import { Transform, Type } from 'class-transformer'
import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
    Matches,
    IsNumber,
} from 'class-validator'
import { GenderType } from 'generated/prisma/enums'

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    surname?: string

    @IsOptional()
    @IsEmail()
    @Transform(({ value }) => value.trim())
    email?: string

    @IsOptional()
    gender?: GenderType

    @IsOptional()
    @IsString()
    password?: string 

    @IsOptional()
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
    newPassword?: string

    @IsOptional()
    @IsString()
    newPasswordAgain?: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    height?: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    weight?: number
}


