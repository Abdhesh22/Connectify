import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import smtpConfig from './config/smtp.config';
import { RoomModule } from './modules/room/room.module';
import { SocketModule } from './modules/socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, smtpConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('app.mongodb.url'),
        retryAttempts: 5,
        retryDelay: 3000
      })
    }),
    AuthModule,
    RoomModule,
    SocketModule
  ],
})
export class AppModule { }