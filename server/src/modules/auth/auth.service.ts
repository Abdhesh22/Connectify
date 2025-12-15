/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BadRequestException, Injectable, Type } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { OtpDto } from '../otp/dto/otp-send.dto';
import { OtpVerifyDto } from '../otp/dto/otp-verify.dto';
import { UserEmailExistDto } from '../user/dto/user-email-exist.dto';
import { OtpService } from '../otp/otp.service';
import { SessionService } from '../session/session.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly otpService: OtpService,
        private readonly sessionService: SessionService
    ) { }

    async register(registerUserDto: RegisterUserDto) {

        const hash = await bcrypt.hash(registerUserDto.password, 10);

        const user = await this.userService.createUser({ ...registerUserDto, password: hash });
        const session = await this.sessionService.createSession({ userId: user._id });

        const payload = { sessionId: session._id };
        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,
            message: 'Congratulations Account has been created',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        };
    }

    async sendOtp(otpDto: OtpDto) {
        return await this.otpService.send(otpDto);
    }

    async verifyOtp(otpVerifyDto: OtpVerifyDto) {
        return await this.otpService.verify(otpVerifyDto);
    }

    async isEmailExist(userEmailExistDto: UserEmailExistDto) {
        return await this.userService.isEmailExist(userEmailExistDto);
    }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.userService.findOneUser({ email: loginUserDto.email });
        if (!user) {
            throw new BadRequestException({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',

            });
        }

        const isMatch = await bcrypt.compare(loginUserDto.password, user.password);
        if (!isMatch) {
            throw new BadRequestException({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            });
        }

        const session = await this.sessionService.createSession({ userId: user._id });

        const payload = { sessionId: session._id };
        const token = await this.jwtService.signAsync(payload);
        console.log({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        })
        return {
            access_token: token,
            message: 'Login Successfully',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        };
    }


    async logout(sessionId: Types.ObjectId) {
        return await this.sessionService.deleteById(sessionId);
    }
}
