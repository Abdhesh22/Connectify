import { Prop } from "@nestjs/mongoose"
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginUserDto {
    @Prop()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Prop()
    @IsNotEmpty()
    password: string;
}