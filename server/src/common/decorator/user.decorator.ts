// decorators/room-session.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../dto/user.dto';


export const User = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): UserDto => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
