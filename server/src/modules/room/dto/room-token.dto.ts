import { IsString, IsNotEmpty } from 'class-validator';

export class RoomTokenDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}