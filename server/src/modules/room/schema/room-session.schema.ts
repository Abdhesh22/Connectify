import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RoomSessionDocument = HydratedDocument<RoomSession>;

@Schema({ timestamps: true })
export class RoomSession {
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true
    })
    userId: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: "Room",
        required: true
    })
    roomId: Types.ObjectId;

    @Prop({
        required: true
    })
    token: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ type: Types.ObjectId, ref: "Participant" })
    participantId: Types.ObjectId

    @Prop({ default: false })
    isHost: boolean
}

export const RoomSessionSchema = SchemaFactory.createForClass(RoomSession);