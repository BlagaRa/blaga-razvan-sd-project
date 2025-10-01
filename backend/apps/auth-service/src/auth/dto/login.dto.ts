import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto{
    @IsString()
    @IsNotEmpty()
    identifier:string;

    @IsNotEmpty()
    @IsString()
    password:string
}