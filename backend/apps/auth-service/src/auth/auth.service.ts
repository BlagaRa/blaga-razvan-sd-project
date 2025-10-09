import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { AdminUpdateUserDto, LoginDto, SignupDto } from "./dto";
import * as argon from "argon2"
import { isEmail } from "class-validator";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "./redis/redis.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable({})
export class AuthService{
    constructor(
        private prisma:PrismaService,
        private jwt:JwtService,
        private config:ConfigService,
        private redis:RedisService
    ){}

    private async updateRefreshTokenHash(userId:number,refreshToken:string){
        const hash=await argon.hash(refreshToken);
        const time=7*24*60*60;
        await this.redis.set(`refresh_token:${userId}`,hash,time)
    }

    


    async newToken(userId:number,refreshToken:string){
        const user=await this.prisma.authUser.findUnique({
            where:{id:userId}
        })

        if (!user) throw new ForbiddenException('Access Denied');

         const storedHash = await this.redis.get(`refresh_token:${userId}`);
        if (!storedHash) throw new ForbiddenException('Access Denied');

        const hashesMatch = await argon.verify(storedHash, refreshToken);
        if (!hashesMatch) throw new ForbiddenException('Access Denied');

        const [newAccessToken,newRefreshToken]=await Promise.all([
            this.signToken(user.id,user.email,user.role==='ADMIN'),
            this.refreshToken(user.id,user.email,user.role==='ADMIN')
        ])
         
        await this.updateRefreshTokenHash(user.id,newRefreshToken)


        return {accessToken:newAccessToken,refreshToken:newRefreshToken}
    }

    async signToken(
        userId:number,
        email:string,
        isAdmin:boolean
    ):Promise<string>{
        const payload={
            sub:userId,
            email,
            isAdmin
        }

        const secret=this.config.get("JWT_SECRET");
        return this.jwt.signAsync(payload,{
            expiresIn:"15m",
            secret
        })
    }

    async refreshToken(
        userId:number,
        email:string,
        isAdmin:boolean
    ){
        const payload={
            sub:userId,
            email,
            isAdmin
        }
        const secret=this.config.get("REFRESH_TOKEN");

        return this.jwt.signAsync(payload,{
            expiresIn:'7d',
            secret
        })
    }

    

    async signup(
        dto:SignupDto
    ){
        try {
            const existingEmail=await this.prisma.authUser.findUnique({
                where:{email:dto.email}
            })
            if(existingEmail){
                throw new BadRequestException("Emailul exista deja")
            }
            const existinUsername=await this.prisma.authUser.findUnique({
                where:{username:dto.username}
            })
            if(existinUsername){
                throw new BadRequestException("Usernameul exista deja")

            }

            if(dto.role==='ADMIN'){
                throw new ForbiddenException("Nu ai dreptul!")
            }

            const hashedPassword=await argon.hash(dto.password);

            const user=await this.prisma.authUser.create({
                data:{
                    email:dto.email,
                    password:hashedPassword,
                    username:dto.username,
                    role:dto.role
                },
                select:{
                    id:true,
                    email:true,
                    username:true,
                    role:true,
                    isEmailVerified:true,
                    isBanned:true,
                    createdAt:true,
                    updatedAt:true
                }
            })

            const [accessToken,refreshToken]=await Promise.all([
                this.signToken(user.id,user.email,user.role==='ADMIN'),
                this.refreshToken(user.id,user.email,user.role==='ADMIN')
            ])

            await this.updateRefreshTokenHash(user.id,refreshToken);

            return {accessToken,refreshToken} 
        } catch (error) {
            if(error instanceof ForbiddenException|| error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
        }
        
    }

    async login(
        dto:LoginDto
    ){
        try {
            const raw=dto.identifier.trim();
            const isEmailId=isEmail(raw);

            const where=isEmailId
            ?{email:raw}
            :{username:raw};

            const user=await this.prisma.authUser.findUnique({where});

            if(!user){
                throw new ForbiddenException("Credentiale incorecte");
            }

            const password=await argon.verify(user.password,dto.password);

            if(!password){
                throw new ForbiddenException("Credentiale incorecte");
            }

            if(user.isBanned===true){
                throw new UnauthorizedException("Esti banat!")
            }


            const [accessToken,refreshToken]=await Promise.all([
                this.signToken(user.id,user.email,user.role==='ADMIN'),
                this.refreshToken(user.id,user.email,user.role==='ADMIN')
            ])
    
            await this.updateRefreshTokenHash(user.id,refreshToken);

            return {accessToken,refreshToken} 

        } catch (error) {
            if(error instanceof UnauthorizedException || error instanceof ForbiddenException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }
    
    async logout(userId: number) {
        try {
            await this.redis.del(`refresh_token:${userId}`);
            await Promise.all([
                this.redis.del(`refresh_token:${userId}`),
                this.redis.del(`access_token:${userId}`)
            ])
            return { message: 'Logout successful' };
        } catch (error) {
            throw new InternalServerErrorException("Server Error!")
        }
        
    }

    async updateAuthById(
        userIdToChange:number,
        dto:AdminUpdateUserDto
    ){
        try {
            const user=await this.prisma.authUser.findUnique({
                where:{id:userIdToChange}
            })

            if(!user){
                throw new BadRequestException("Userul nu exista!")
            }

            if(dto.username){
                const username=await this.prisma.authUser.findUnique({
                    where:{username:dto.username}
                })

                if(username){
                    throw new BadRequestException("Username ul exista deja")
                }
            }
            

            if(dto.email){
                const email=await this.prisma.authUser.findUnique({
                    where:{username:dto.email}
                })

                if(email){
                    throw new BadRequestException("Email ul exista deja")
                }
            }
            
            const newUser=await this.prisma.authUser.update({
                where:{
                    id:userIdToChange
                },
                data:{
                    ...dto
                }
            })

            return newUser;

            
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

    async getAllAuth(){
        try {
            const auths=await this.prisma.authUser.findMany({
                orderBy:{
                    id:'asc'
                }
            })

            return auths;
        } catch (error) {
            throw new InternalServerErrorException("Eroare la server!")
        }
    }

    async getAuthById(
        userId:number
    ){
        try {
            const user=await this.prisma.authUser.findUnique({
                where:{id:userId}
            })

            if(!user){
                throw new BadRequestException("Userul nu exista!")
            }

            return user;
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error
            }
            throw new InternalServerErrorException("Eroare la server!")

        }
    }

    


}