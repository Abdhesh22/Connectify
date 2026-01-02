import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';
import { MediasoupModule } from '../mediasoup/mediasoup.module';

@Module({
  imports: [
    SessionModule,
    UserModule,
    MediasoupModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwt.secret'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway], // so other modules can emit events
})
export class SocketModule { }
