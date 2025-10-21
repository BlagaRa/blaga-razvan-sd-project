import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorator';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { JwtGuard } from '../auth/guard';
import { UpdateDeviceDto } from './dto';
import { AdminGuard } from '../auth/guard/admin.guard';

@UseGuards(JwtGuard)
@Controller('device')
export class DeviceController {
    constructor(private deviceService:DeviceService){}
    @Post('create')
    createDevice(
        @CurrentUser() user:{userId:number},
        @Body() device:CreateDeviceDto
    ){
        return this.deviceService.createDevice(user.userId,device);
    }

    @Get('my-devices')
    getMyDevices(
        @CurrentUser() user:{userId:number}
    ){
        return this.deviceService.getMyDevices(user.userId);
    }

    @Put('update-device/:id')
    updateDeviceById(
        @CurrentUser() user:{userId:number},
        @Body() dto:UpdateDeviceDto,
        @Param('id') deviceId:string

    ){
        return this.deviceService.updateDeviceById(user.userId,dto,+deviceId);  
    }

    @Delete('delete-device/:id')
    deleteDeviceById(
        @CurrentUser() user:{userId:number},
        @Param('id') deviceId:string
    ){
        return this.deviceService.deleteDeviceById(user.userId,+deviceId);
    }

    @UseGuards(AdminGuard)
    @Get('admin')
    getAllDevices(

    ){
        return this.deviceService.getAllDevices();
    }
    @UseGuards(AdminGuard)
    @Get('admin/:id')
    getDeviceByIdAsAdmin(
        @Param("id") deviceId:string,
    ){
        return this.deviceService.getDeviceByIdAsAdmin(+deviceId)
    }

    @UseGuards(AdminGuard)
    @Put("admin/:id")
    updateDeviceByIdAsAdmin(
        @Param("id") deviceId:string,
        @Body() dto:UpdateDeviceDto

    ){
        return this.deviceService.updateDeviceByIdAsAdmin(+deviceId,dto)
    }
    @UseGuards(AdminGuard)
    @Delete("admin/:id")
    deleteDeviceByIdAsAdmin(
        @Param("id") deviceId:string
    ){
        return this.deviceService.deleteDeviceByIdAsAdmin(+deviceId)
    }





}
