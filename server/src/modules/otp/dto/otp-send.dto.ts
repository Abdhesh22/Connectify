import { IsEmail, IsNotEmpty } from "class-validator";

export class OtpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}