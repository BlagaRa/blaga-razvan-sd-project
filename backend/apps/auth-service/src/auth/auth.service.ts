import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { LoginDto, SignupDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2"
import { dmmfToRuntimeDataModel, PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { isEmail } from "class-validator";

@Injectable({})
export class AuthService{
    constructor(private prisma:PrismaService){}

    async signup(dto:SignupDto){
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

            return user;
        } catch (error) {
            if(error instanceof ForbiddenException|| BadRequestException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
        }
        
    }

    async login(dto:LoginDto){
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

            return user;  

        } catch (error) {
            if(error instanceof UnauthorizedException || ForbiddenException){
                throw error;
            }
            throw new InternalServerErrorException("Eroare la server!")
            
        }
    }

}