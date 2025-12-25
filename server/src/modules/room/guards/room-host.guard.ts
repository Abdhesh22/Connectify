import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RoomService } from '../service/room.service';


@Injectable()
export class RoomHostGuard implements CanActivate {
    constructor(private readonly roomService: RoomService) { };

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {

            if (!request.roomSession.isHost) {
                throw new UnauthorizedException({
                    message: 'You are not authorized to perform this action',
                    reason: 'NOT_HOST',
                });
            }

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException();
        }
        return true;
    }

}
