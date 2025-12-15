import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Otp } from './schema/otp.schema';
import { OTP_PURPOSE } from 'src/common/constants/otp.constant';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OtpDto } from './dto/otp-send.dto';
import { MailService } from '../mail/mail.service';
import bcrypt from "bcrypt"
import { OtpVerifyDto } from './dto/otp-verify.dto';
import dayjs from 'dayjs';
@Injectable()
export class OtpService {

    constructor(
        @InjectModel(Otp.name) private otpModel: Model<Otp>,
        private readonly mailService: MailService
    ) { }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async send(otpDTO: OtpDto) {
        try {

            const otp = this.generateOtp();
            const otpHash = await bcrypt.hash(otp, 10);

            await this.otpModel.updateOne(
                {
                    email: otpDTO.email,
                    purpose: OTP_PURPOSE.REGISTER,
                },
                {
                    $set: {
                        otpHash,
                        attempts: 0,
                        expiresAt: dayjs().add(15, 'minute').toDate(),
                    },
                },
                {
                    upsert: true,
                },
            );
            await this.mailService.sendOtpMail(otpDTO.email, otp);
            return {
                success: true,
                message: 'OTP Sent Successfully'
            }

        } catch (error) {
            throw new InternalServerErrorException({
                success: false,
                message: 'Failed to send OTP',
            });
        }
    }

    async verify(otpVerifyDto: OtpVerifyDto) {
        const otpDoc = await this.otpModel.findOne({
            email: otpVerifyDto.email,
        });

        if (!otpDoc) {
            throw new BadRequestException({
                success: false,
                code: 'OTP_NOT_FOUND',
                message: 'OTP expired',
            });
        }

        const isMatch = await bcrypt.compare(
            otpVerifyDto.otp,
            otpDoc.otpHash,
        );

        if (!isMatch) {
            throw new BadRequestException({
                success: false,
                code: 'OTP_NOT_VALID',
                message: 'OTP is not valid',
            });
        }

        return {
            success: true,
            message: 'OTP verified successfully',
        };
    }

}
