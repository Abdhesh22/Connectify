import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './schema/session.schema';
import { Model, Types } from 'mongoose';
import dayjs from 'dayjs';

@Injectable()
export class SessionService {
    constructor(@InjectModel(Session.name) private readonly sessionModel: Model<Session>) { };
    async createSession({ userId }) {
        return await this.sessionModel.create({
            userId: userId,
            expiresAt: dayjs().add(1, 'day').toDate()
        });
    }

    async findById(id) {
        return await this.sessionModel.findById(id);
    }


    async deleteById(_id: Types.ObjectId) {
        return this.sessionModel.deleteOne({ _id: _id });
    }

    async updateOneSession(_id: Types.ObjectId, payload: Partial<Session>) {
        return this.sessionModel.updateOne(
            { _id: _id },
            { $set: payload }
        );
    }


}
