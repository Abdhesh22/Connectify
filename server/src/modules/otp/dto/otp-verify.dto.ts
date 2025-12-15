import { Prop } from "@nestjs/mongoose";
import { IsEmail, IsNotEmpty } from "class-validator";

export class OtpVerifyDto {
    @Prop()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Prop()
    @IsNotEmpty()
    otp: string;
}