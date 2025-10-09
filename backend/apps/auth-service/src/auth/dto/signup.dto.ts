import { Role } from "../../../generated/auth-user";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignupDto{
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    username:string;

    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password:string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(Role)
    role:Role
}