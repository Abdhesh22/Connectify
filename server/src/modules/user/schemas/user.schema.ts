import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { USER_STATUS } from "src/common/enum/user-status.enum";

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true
})
export class User {
    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ type: String, default: USER_STATUS.ACTIVE, enum: USER_STATUS })
    status: string;
}


export const UserSchema = SchemaFactory.createForClass(User);