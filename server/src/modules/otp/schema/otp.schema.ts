import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OtpPurpose } from 'src/common/enum/otp.enum';
export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
    @Prop({ required: true, index: true })
    email: string;

    @Prop({ required: true })
    otpHash: string;

    @Prop({ required: true, enum: OtpPurpose })
    purpose: OtpPurpose;

    @Prop({ required: true, expires: 300 })
    expiresAt: Date;
}


export const OtpSchema = SchemaFactory.createForClass(Otp);