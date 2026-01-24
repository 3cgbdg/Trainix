import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, matches, MinLength } from "class-validator";
import { GenderType } from "generated/prisma/enums";

export class CreateAuthDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    @IsNotEmpty()
    surname: string;
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    email: string;
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
    password: string;
    @IsDate()
    dateOfBirth: string
    @IsNotEmpty()
    gender: GenderType
}
