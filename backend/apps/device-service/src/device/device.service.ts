import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto';
import { PrismaClientRustPanicError } from '@prisma/client/runtime/library';

@Injectable()
export class DeviceService {
    constructor(private prisma:PrismaService){}

    async createDevice(userId:number,device:CreateDeviceDto){
        try {

            const sameDevice=await this.prisma.device.findFirst({
                where:{userId,name:device.name}
            })

            if(sameDevice){
                throw new ForbiddenException("Acest device exista deja!")
            }

            const newDevice=await this.prisma.device.create({
                data:{
                    userId,
                    ...device,
                }
            })

            return {message:"Device creat cu success",newDevice};
        } catch (error) {
            if(error instanceof ForbiddenException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }
    async getMyDevices(userId:number){
        try {
            const devices=await this.prisma.device.findMany({
                where:{userId},
                orderBy:{
                    id:'asc'
                }
            })


            return {devices};
        } catch (error) {
            throw new InternalServerErrorException("Eroare la server!")
        }
    }

    async updateDeviceById(
        userId:number,
        dto:UpdateDeviceDto,
        deviceId:number
    ){
        try {
            if (!dto || Object.values(dto).every(v => v === undefined)) {
                throw new BadRequestException('Trebuie să specifici cel puțin un câmp de actualizat!');
            }

            const device=await this.prisma.device.findUnique({
                where:{
                    id:deviceId
                }
            })



            if(!device){
                throw new BadRequestException("Device-ul nu exista!")
            }

            if(device.userId!==userId){
                throw new ForbiddenException("Nu poti face update la acest device!")
            }

            const newDevice=await this.prisma.device.update({
                where:{id:deviceId},
                data:{
                    ...dto
                }
            })
            return {newDevice};
        } catch (error) {
            if(error instanceof ForbiddenException || error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
        }
    }
    async deleteDeviceById(
        userId:number,
        deviceId:number
    ){
        try {
            const device=await this.prisma.device.findUnique({
                where:{id:deviceId}
            })

            if(!device){
                throw new BadRequestException("Acest device nu exista!")
            }

            if(device.userId!==userId){
                throw new ForbiddenException("Nu ai voie!")
            }

            await this.prisma.device.delete({
                where:{id:deviceId}
            })
            return {message:"Device sters cu successs"}
        } catch (error) {

            if(error instanceof BadRequestException || error instanceof ForbiddenException){
                throw error;
            }

            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

    async getAllDevices(){
        try {
            const devices=await this.prisma.device.findMany();
            console.log("merge")
            return devices ;
        } catch (error) {
            throw new InternalServerErrorException("Eroare la server!")
        }
    }

    async getDeviceByIdAsAdmin(deviceId:number){
        try {
            const device=await this.prisma.device.findUnique({
                where:{id:deviceId}
            })

            if(!device){
                throw new BadRequestException("Device ul nu exista!")
            }

            return device;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

    async updateDeviceByIdAsAdmin(
        deviceId:number,
        dto:UpdateDeviceDto
    ){
        try {
            const device=await this.prisma.device.findUnique({
                where:{id:deviceId}
            })

            if(!device){
                throw new BadRequestException("Device ul nu exista!")
            }

            if(dto.name){
                const deviceName=await this.prisma.device.findUnique({
                    where:{userId:device.userId,
                        name:dto.name
                    }
                })
                if(deviceName){
                    throw new BadRequestException("Exista deja un device cu acest nume pentru acest utilizator!")
                }
            }
            

            await this.prisma.device.update({
                where:{id:deviceId},
                data:{
                    ...dto
                }
            })
            return {message:"device modificat cu success"}
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

    async deleteDeviceByIdAsAdmin(deviceId:number){
        try {
            const device=await this.prisma.device.findUnique({
                where:{id:deviceId}
            })
            if(!device){
                throw new BadRequestException("Device ul nu exista!")
            }

            await this.prisma.device.delete({
                where:{id:deviceId}
            })
            return {message:"device sters cu success"}
        } catch (error) {
            if(error instanceof PrismaClientRustPanicError){
                throw error;
            }
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")

            
        }
    }
}
