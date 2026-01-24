import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, Matches } from "class-validator";

export class LoginAuthDto {
    
    @Transform(({value})=>value.trim())
    @IsNotEmpty()
    @IsEmail()
    email:string;
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
    password:string;

}
