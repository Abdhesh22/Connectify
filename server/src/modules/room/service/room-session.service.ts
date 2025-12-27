import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoomSession, RoomSessionDocument } from '../schema/room-session.schema';
import dayjs from 'dayjs';

@Injectable()
export class RoomSessionService {
    constructor(
        @InjectModel(RoomSession.name) private roomSessionModel: Model<RoomSession>
    ) { };

    async create(document: Partial<RoomSession>): Promise<RoomSessionDocument> {
        return this.roomSessionModel.create(document);
    }

    async findOne(filterCondition, projection = {}) {
        console.log("filterCondition", filterCondition);
        return await this.roomSessionModel.findOne(filterCondition, projection);
    }

    async updateById(_id: Types.ObjectId, payload: Partial<RoomSession>) {
        return await this.roomSessionModel.updateOne(
            { _id: _id },
            { $set: payload }
        );
    }

    async deleteById(_id: Types.ObjectId) {
        return this.roomSessionModel.deleteOne({ _id: _id });
    }


    async deleteOne(filter) {
        return this.roomSessionModel.deleteOne(filter);
    }

}
