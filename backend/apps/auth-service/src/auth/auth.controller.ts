import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AdminUpdateUserDto, LoginDto, SignupDto } from "./dto";
import { CurrentUser } from "apps/device-service/src/auth/decorator";
import { AdminGuard } from "./auth/guard";

@Controller('auth')
export class AuthController{
    constructor(private authService:AuthService){}

    @Post('signup')
    signup(
        @Body() dto:SignupDto
    ){
        return this.authService.signup(dto);
    }

    @Post('login')
    login(
        @Body() dto:LoginDto
    ){
        return this.authService.login(dto);
    }

    @Post('logout')
    logout(@Body("userId") userId:number){
        return this.authService.logout(userId)
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    refreshTokens(@Body('refreshToken') refresh: string) {
        const { userId, refreshToken } = this.decodeTokenAndGetUserId(refresh);
        return this.authService.newToken(userId, refreshToken);
    }

    @UseGuards(AdminGuard)
    @Put('admin/:id')
    updateAuthById(
        @Param("id") userIdToChange:string,
        @Body() dto:AdminUpdateUserDto
    ){
        return this.authService.updateAuthById(+userIdToChange,dto)
    }

    @UseGuards(AdminGuard)
    @Get('admin')
    getAllAuth(){
        return this.authService.getAllAuth()
    }

    @UseGuards(AdminGuard)
    @Get("admin/:id")
    getAuthById(
        @Param("id") userId:string
    ){
        return this.authService.getAuthById(+userId)
    }



    private decodeTokenAndGetUserId(token: string): { userId: number, refreshToken: string } {
        try {
            const decoded = this.authService['jwt'].decode(token) as { sub: number };
            
            if (!decoded || typeof decoded.sub !== 'number') {
                throw new ForbiddenException("Invalid refresh token");
            }

            return { userId: decoded.sub, refreshToken: token };
        } catch(e) {
            throw new ForbiddenException("Invalid refresh token");
        }
    }

    



}