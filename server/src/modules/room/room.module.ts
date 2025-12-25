import { Module } from '@nestjs/common';
import { RoomService } from './service/room.service';
import { RoomController } from './room.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schema/room.schema';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RoomSession, RoomSessionSchema } from './schema/room-session.schema';
import { RoomSessionService } from './service/room-session.service';
import { SocketModule } from '../socket/socket.module';
import { Participant, ParticipantSchema } from './schema/room-participants.schema';
import { JoinRequest, JoinRequestSchema } from './schema/room-join-request.schema';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('app.jwt.secret'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
        UserModule,
        SessionModule,
        AuthModule,
        SocketModule,
        MongooseModule.forFeature([
            {
                name: Room.name,
                schema: RoomSchema
            },
            {
                name: RoomSession.name,
                schema: RoomSessionSchema
            },
            {
                name: Participant.name,
                schema: ParticipantSchema
            },
            {
                name: JoinRequest.name,
                schema: JoinRequestSchema
            }
        ]),
    ],
    providers: [RoomService, RoomSessionService],
    controllers: [RoomController]
})
export class RoomModule { }
