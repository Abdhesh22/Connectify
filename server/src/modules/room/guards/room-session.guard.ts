
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RoomSessionService } from '../service/room-session.service';
import dayjs from 'dayjs';

@Injectable()
export class RoomSessionGuard implements CanActivate {
    constructor(private readonly roomSessionService: RoomSessionService) { };

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {

            const roomSession = await this.roomSessionService.findOne({ _id: token });

            if (!roomSession) {
                throw new UnauthorizedException({ message: 'Room Session Expired', reason: 'ROOM_SESSION_TERMINATE' })
            }

            if (dayjs(roomSession.expiresAt).isBefore(dayjs())) {
                await this.roomSessionService.deleteById(roomSession._id);
                throw new UnauthorizedException({ message: 'Room Session Expired', reason: 'ROOM_SESSION_TERMINATE' })
            }

            await this.roomSessionService.updateById(roomSession._id, {
                expiresAt: dayjs().add(15, 'minute').toDate()
            });

            request['roomSession'] = roomSession;

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException();
        }
        return true;
    }


    private extractTokenFromHeader(request: Request): string | undefined {
        return request.headers['x-room-session'];
    }

}
