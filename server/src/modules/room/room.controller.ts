import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { RoomService } from './service/room.service';
import { AuthGuard } from '../auth/auth.guard';
import { RoomPermissionGuard } from './guards/room-permission.guard';
import { RoomTokenDto } from './dto/room-token.dto';
import { RoomHostGuard } from './guards/room-host.guard';
import { JoinActionDto } from './dto/room-join-action.dto';
import { ParticipantListDto } from './dto/room-participant.dto';
import { JoinRequestListDto } from './dto/room-join-request.dto';
import { RoomSessionGuard } from './guards/room-session.guard';
import { RoomSessionDto } from './dto/room-session.dto';
import { RoomSession } from 'src/modules/room/decorator/room-session.decorator';
import { User } from 'src/common/decorator/user.decorator';
import { UserDto } from 'src/common/dto/user.dto';
import { RoomPermission } from './decorator/room-permission.decorator';
import { RoomPermissionDto } from './dto/room-permission.dto';


@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }
    @Post("")
    @UseGuards(AuthGuard)
    create(
        @User() user: UserDto
    ) {
        return this.roomService.create(user._id);
    }

    @Post("join/:token")
    @UseGuards(AuthGuard, RoomPermissionGuard)
    join(
        @User() user: UserDto,
        @RoomPermission() roomPermission: RoomPermissionDto,
        @Param() roomTokenDto: RoomTokenDto) {
        return this.roomService.join(user._id, roomPermission.isHost, roomTokenDto.token);
    }

    @Post("leave")
    @UseGuards(AuthGuard, RoomSessionGuard)
    leave(
        @RoomSession() roomSession: RoomSessionDto
    ) {
        return this.roomService.leave(roomSession);
    }

    @Post('accept')
    @UseGuards(AuthGuard, RoomSessionGuard, RoomHostGuard)
    acceptInvite(
        @RoomSession() roomSessionDto: RoomSessionDto,
        @Body() joinActionDto: JoinActionDto,
        @Param() roomTokenDto: RoomTokenDto
    ) {
        return this.roomService.acceptInvite(roomSessionDto.roomId, joinActionDto, roomTokenDto.token);
    }

    @Post('reject')
    @UseGuards(AuthGuard, RoomSessionGuard, RoomHostGuard)
    rejectInvite(
        @Body() joinActionDto: JoinActionDto,
        @Param() roomTokenDto: RoomTokenDto) {

        return this.roomService.rejectInvite(joinActionDto, roomTokenDto);
    }

    @Delete('participant')
    @UseGuards(AuthGuard)
    removeParticipant() {
        return this.roomService.removeParticipant();
    }

    @Post('session')
    @UseGuards(AuthGuard, RoomSessionGuard)
    session(@RoomSession() roomSessionDto: RoomSessionDto) {
        return roomSessionDto;
    }

    @Get('participants')
    @UseGuards(AuthGuard, RoomSessionGuard)
    participants(
        @RoomSession() roomSessionDto: RoomSessionDto,
        @Query() participantListDto: ParticipantListDto
    ) {
        return this.roomService.participants(participantListDto, roomSessionDto);
    }


    @Get('join-request')
    @UseGuards(AuthGuard, RoomSessionGuard)
    joinRequest(
        @RoomSession() roomSessionDto: RoomSessionDto,
        @Query() participantListDto: JoinRequestListDto
    ) {
        return this.roomService.joinRequest(participantListDto, roomSessionDto);
    }

}
