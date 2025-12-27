import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class RoomSessionDto {

    @ApiProperty({ description: 'Room ID' })
    @IsMongoId()
    roomId: Types.ObjectId;

    @ApiProperty({ description: 'User ID' })
    @IsMongoId()
    userId: string;

    @ApiProperty({ description: 'Is current user host of the room' })
    @IsBoolean()
    isHost: boolean;

    @ApiProperty({ description: 'Room session token' })
    @IsString()
    token: string;

    @ApiProperty({ description: 'Session created time', required: false })
    @IsOptional()
    joinedAt?: Date;


    @ApiProperty({ description: "Room Participant Id", required: false })
    @IsNotEmpty()
    @IsMongoId()
    participantId: Types.ObjectId
}
