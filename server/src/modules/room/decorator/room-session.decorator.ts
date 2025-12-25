// decorators/room-session.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RoomSessionDto } from '../dto/room-session.dto';

export const RoomSession = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): RoomSessionDto => {
        const request = ctx.switchToHttp().getRequest();
        return request.roomSession;
    },
);
