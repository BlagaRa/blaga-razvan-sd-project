import { Role } from "../../../generated/auth-user";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class AdminUpdateUserDto{
    @IsString()
    @IsOptional()
    @MinLength(4)
    username?:string;

    @IsEmail()
    @IsOptional()
    email?:string;

    @IsString()
    @IsOptional()
    @IsEnum(Role)
    role?:Role

    @IsBoolean()
    @IsOptional()
    isBanned?:boolean

}