import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type JoinRequestDocument = HydratedDocument<JoinRequest>;
@Schema({ timestamps: true })
export class JoinRequest {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Room", required: true })
    roomId: Types.ObjectId;

    @Prop({ default: false })
    isJoined: Boolean;

}

export const JoinRequestSchema = SchemaFactory.createForClass(JoinRequest);