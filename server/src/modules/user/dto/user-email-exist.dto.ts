import { Prop } from "@nestjs/mongoose";
import { IsEmail, IsNotEmpty } from "class-validator";

export class UserEmailExistDto {
    @Prop()
    @IsNotEmpty()
    @IsEmail()
    email: string
}