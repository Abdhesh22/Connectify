
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import dayjs from 'dayjs';
import { USER_STATUS } from 'src/common/constants/user-status.constant';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly userService: UserService,
        private readonly sessionService: SessionService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {

            const payload = await this.jwtService.verifyAsync(token, {
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

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
