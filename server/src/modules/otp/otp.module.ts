import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MailModule } from '../mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schema/otp.schema';


@Module({
  imports: [MailModule, MongooseModule.forFeature([{
    name: Otp.name,
    schema: OtpSchema
  }])],
  providers: [OtpService],
  exports: [OtpService]
})
export class OtpModule { }