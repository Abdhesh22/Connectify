import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RoomPermissionDto } from '../dto/room-permission.dto';

export const RoomPermission = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): RoomPermissionDto => {
        const request = ctx.switchToHttp().getRequest();
        return request.permission;
    },
);
