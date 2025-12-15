import { Body, Controller, Get, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../user/dto/register-user.dto';
import { OtpDto } from '../otp/dto/otp-send.dto';
import { OtpVerifyDto } from '../otp/dto/otp-verify.dto';
import { UserEmailExistDto } from '../user/dto/user-email-exist.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { LoginUserDto } from '../user/dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto, @Res({ passthrough: true }) res) {
        const { access_token, message, user } = await this.authService.register(registerUserDto);
        res.setHeader('Authorization', `Bearer ${access_token}`);
        return { message, user };
    }

    @Post("login")
    async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res) {
        const { access_token, message, user } = await this.authService.login(loginUserDto);
        res.setHeader('Authorization', `Bearer ${access_token}`);
        return { message, user }
    }

    @Post("send-otp")
    async sendOtp(@Body() otpDto: OtpDto) {
        return await this.authService.sendOtp(otpDto);
    }

    @Post("verify-otp")
    async verifyOtp(@Body() otpVerifyDto: OtpVerifyDto) {
        return await this.authService.verifyOtp(otpVerifyDto);
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    async logout(@Request() req) {
        return await this.authService.logout(req.sessionId);
    }

    @Get('email-exist')
    async isEmailExist(@Query() userEmailExistDto: UserEmailExistDto) {
        return await this.authService.isEmailExist(userEmailExistDto);
    }

    @Post('session')
    @UseGuards(AuthGuard)
    createSession(@Request() req) {
        return {
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
        };
    }

}
