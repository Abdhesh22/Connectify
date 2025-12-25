import { IsBoolean } from "class-validator";

export class RoomPermissionDto {
    @IsBoolean()
    isHost: boolean
}