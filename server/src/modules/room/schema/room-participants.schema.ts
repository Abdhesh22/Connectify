import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ParticipantDocument = HydratedDocument<Participant>;
@Schema({ timestamps: true })
export class Participant {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ default: Date.now })
    joinedAt: Date;

    @Prop({ type: Types.ObjectId, ref: "Room", required: true })
    roomId: Types.ObjectId;

    @Prop({ default: null })
    leftAt?: Date;

    @Prop({ default: false })
    isHost: boolean

    @Prop({ type: Types.ObjectId, ref: 'JoinRequest' })
    joinRequestId: Types.ObjectId

    @Prop({ default: false })
    mic: boolean

    @Prop({ default: false })
    camera: boolean
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);