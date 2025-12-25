import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/modules/user/user.module';
import { MailModule } from '../mail/mail.module';
import { OtpModule } from '../otp/otp.module';
import { SessionModule } from '../session/session.module';
import { AuthGuard } from './auth.guard';


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
    MailModule,
    OtpModule,
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard]
})
export class AuthModule { }

