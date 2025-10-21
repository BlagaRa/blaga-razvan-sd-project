import { BadGatewayException, BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
    constructor(private prisma:PrismaService){}

    async createProfile(dto:CreateProfileDto,userId:number){

        try {
            const existingUser=await this.prisma.profile.findUnique({where:{userId}});

            if(existingUser){
                throw new ForbiddenException("Ai deja un profil!")
            }

            const profile=await this.prisma.profile.create({
                data:{
                    ...dto,
                    userId
                }
            })

            return profile;

        } catch (error) {
            if(error instanceof ForbiddenException){
                throw error;
            }

            throw new InternalServerErrorException("Eroare la server!")
        }

    }

    async getMyProfile(userId:number){
        try {
            const existingProfile=await this.prisma.profile.findUnique({
                where:{userId}
            })

            if(!existingProfile){
                throw new ForbiddenException("Trebuie sa iti creezi un profil!")
            }

            return existingProfile;

        } catch (error) {
            if(error instanceof ForbiddenException){
                throw error;
            }

            throw new InternalServerErrorException("Eroare la server!")
        }
    }

    async updateProfile(
        userId:number,
        dto:UpdateProfileDto
    ){
        try {
            const profile=await this.prisma.profile.findUnique({where:{userId}});

            if(!profile){
                throw new ForbiddenException("Trebuie sa iti creezi un profil!")
            }

            const newProfile=await this.prisma.profile.update({
                where:{userId},
                data:{
                    ...dto
                }
            })

            return newProfile;
        } catch (error) {
            if(error instanceof ForbiddenException){
                throw error;
            }

            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

    async getAllProfiles(){
        try {
            const profiles=await this.prisma.profile.findMany({
                orderBy:{id:'asc'}
            })

            return profiles;
        } catch (error) {
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

    async getProfileById(profileId:number){
        try {
            const profile=await this.prisma.profile.findUnique({
                where:{id:profileId}
            })
            if(!profile){
                throw new BadRequestException("Profilul nu exista!")
            }

            return profile;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }

    }

    async updateProfileById(
        profileId:number,
        dto:UpdateProfileDto
    ){
        try {
            const profile=await this.prisma.profile.findUnique({where:{id:profileId}})
            if(!profile){
                throw new BadRequestException("Profilul nu exista!")
            }
            await this.prisma.profile.update({
                where:{id:profileId},
                data:{
                    ...dto
                }
            })
            return {message:"Profil modificat cu success!"}
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

}
