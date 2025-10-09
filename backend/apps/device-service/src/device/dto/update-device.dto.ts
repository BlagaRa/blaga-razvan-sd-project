import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"
import { Room, Status, Type } from "../../../generated/device-service"

export class UpdateDeviceDto{
    @IsOptional()
    @IsString()
    @MaxLength(20)
    name?:string

    @IsOptional()
    @IsNumber()
    maxConsumption?:number

    @IsOptional()
    @IsEnum(Room)
    room?:Room

    @IsOptional()
    @IsEnum(Status)
    status?:Status

    @IsOptional()
    @IsEnum(Type)
    type?:Type
}