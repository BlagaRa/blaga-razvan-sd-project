import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"
import { Room, Status, Type } from "../../../generated/device-service"

export class CreateDeviceDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    name:string

    @IsNumber()
    @IsNotEmpty()
    maxConsumption:number

    @IsNotEmpty()
    @IsEnum(Room)
    room:Room

    @IsOptional()
    @IsEnum(Status)
    status?:Status

    @IsNotEmpty()
    @IsEnum(Type)
    type:Type
}