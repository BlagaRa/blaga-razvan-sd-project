import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { LoginDto, SignupDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2"
import { isEmail } from "class-validator";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService{
    constructor(
        private prisma:PrismaService,
        private jwt:JwtService,
        private config:ConfigService
    ){}

    async signup(
        dto:SignupDto
    ):Promise<string>{
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

            return this.signToken(user.id,user.email);
        } catch (error) {
            if(error instanceof ForbiddenException|| BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
        }
        
    }

    async login(
        dto:LoginDto
    ):Promise<string>{
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

            return this.signToken(user.id,user.email);  

        } catch (error) {
            if(error instanceof UnauthorizedException || ForbiddenException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

    async signToken(
        userId:number,
        email:string
    ):Promise<string>{
        const payload={
            sub:userId,
            email
        }

        const secret=this.config.get("JWT_SECRET");
        return this.jwt.signAsync(payload,{
            expiresIn:"15m",
            secret
        })
    }
}