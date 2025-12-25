import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { RoomService } from '../service/room.service';


@Injectable()
export class RoomPermissionGuard implements CanActivate {
    constructor(private readonly roomService: RoomService) { };

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        try {

            const token = request.params.token;
            const userId = request.user._id;
            const room = await this.roomService.findOne({ token }, { hostId: 1 });

            if (!room) {
                throw new UnauthorizedException({ message: 'Room Not Exist' })
            }

            let isHost = true;
            if (room?.hostId.toString() != userId.toString()) {
                isHost = false;
            }

            request['permission'] = {
                isHost: isHost
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
