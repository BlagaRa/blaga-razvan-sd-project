import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { ProfileService } from './profile.service';
import { AdminGuard, JwtGuard } from '../auth/guard';
import { CurrentUser } from '../auth/decorator';

@UseGuards(JwtGuard)
@Controller('profile')
export class ProfileController {

    constructor(private profileService:ProfileService){}
    
    @Post('create')
    createProfile(
        @Body() dto:CreateProfileDto,
        @CurrentUser() user:{userId:number}

    ){
        return this.profileService.createProfile(dto,user.userId);

    }

    @Get('me')
    getMyProfile(
        @CurrentUser() user:{userId:number}
    ){
        return this.profileService.getMyProfile(user.userId);
    }

    @Put('update')
    updateProfile(
        @CurrentUser() user:{userId:number},
        @Body() dto:UpdateProfileDto
    ){
        return this.profileService.updateProfile(user.userId,dto)
    }

    @UseGuards(AdminGuard)
    @Get("admin")
    getAllProfiles(

    ){
        return this.profileService.getAllProfiles();
    }

    @UseGuards(AdminGuard)
    @Get('admin/:id')
    getProfileById(
        @Param("id") userId:string
    ){
        return this.profileService.getProfileById(+userId)
    }

    @UseGuards(AdminGuard)
    @Put('admin/:id')
    updateProfileById(
        @Param("id") userId:string,
        @Body() dto:UpdateProfileDto

    ){
        return this.profileService.updateProfileById(+userId,dto);
    }

}
