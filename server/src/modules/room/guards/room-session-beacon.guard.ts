
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RoomSessionService } from '../service/room-session.service';
import dayjs from 'dayjs';
import { SessionService } from 'src/modules/session/session.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import { USER_STATUS } from 'src/common/constants/user-status.constant';
import { Types } from 'mongoose';

@Injectable()
export class RoomSessionBeaconGuard implements CanActivate {
    constructor(
        private readonly roomSessionService: RoomSessionService,
        private readonly sessionService: SessionService,
        private jwtService: JwtService,
        private readonly userService: UserService
    ) { };

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();

        try {

            const jwtToken = request.body.sessionId;
            const roomToken = request.body.roomSessionId;

            const payload = await this.jwtService.verifyAsync(jwtToken, {
                secret: process.env.JWT_TOKEN
            });

            const session = await this.sessionService.findById(payload.sessionId);
            if (!session) {
                throw new UnauthorizedException({ message: 'Session Expired', reason: 'SESSION_TERMINATE' })
            }

            if (dayjs(session.expiresAt).isBefore(dayjs())) {
                await this.sessionService.deleteById(session._id);
                throw new UnauthorizedException({ message: 'Session Expired', reason: 'SESSION_TERMINATE' })
            }

            const user = await this.userService.findById(session.userId, { password: 0 });
            if (!user || user.status == USER_STATUS.INACTIVE) {
                await this.sessionService.deleteById(session._id);
                throw new UnauthorizedException({ message: 'Session Expired', reason: 'SESSION_TERMINATE' })
            }

            await this.sessionService.updateOneSession(session._id, {
                expiresAt: dayjs().add(1, 'hour').toDate()
            });

            const roomSession = await this.roomSessionService.findOne({ _id: new Types.ObjectId(roomToken) });
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
            request['sessionId'] = session._id;
            request['user'] = user;

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException();
        }
        return true;
    }

}
