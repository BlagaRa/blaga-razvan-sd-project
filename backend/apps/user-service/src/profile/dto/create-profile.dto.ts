import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateProfileDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    firstName:string

    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    lastName:string

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    description:string

    @IsString()
    @IsOptional()
    avatarImage?:string
}