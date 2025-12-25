import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true
    })
    hostId: Types.ObjectId;

    @Prop({
        required: true
    })
    token: string

}

export const RoomSchema = SchemaFactory.createForClass(Room);