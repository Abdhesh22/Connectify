import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UserDto {

    @ApiProperty({ description: 'user ID' })
    @IsMongoId()
    _id: Types.ObjectId;

    @ApiProperty({ description: 'User first name' })
    @IsString()
    firstName: string;

    @ApiProperty({ description: 'User last name' })
    @IsString()
    lastName: string;

    @ApiProperty({ description: 'User Email' })
    @IsEmail()
    email: string
}
