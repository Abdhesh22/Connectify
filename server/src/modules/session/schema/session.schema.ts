import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    expiresAt: Date;
}


export const SessionSchema = SchemaFactory.createForClass(Session);