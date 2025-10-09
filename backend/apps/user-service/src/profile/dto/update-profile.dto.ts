import {  IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileDto{
    @IsString()
    @IsOptional()
    @MaxLength(20)
    firstName?:string

    @IsString()
    @IsOptional()
    @MaxLength(20)
    lastName?:string

    @IsString()
    @IsOptional()
    @MaxLength(200)
    description?:string

    @IsString()
    @IsOptional()
    avatarImage?:string
}