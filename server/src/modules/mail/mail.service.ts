import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter;

    constructor(private configService: ConfigService) {
        const smtp = this.configService.get('smtp');
        this.transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure,
            auth: smtp.auth,
        });
    }

    async sendOtpMail(email: string, otp: string) {
        try {
            const from = this.configService.get('smtp.from');
            await this.transporter.sendMail({
                from,
                to: email,
                subject: 'Your Connectify OTP',
                html: `<h2>Verify your email</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP is valid for 5 minutes.</p>`,
            });
        } catch (error) {
            throw error;
        }
    }
}