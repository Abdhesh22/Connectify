import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from '../schema/room.schema';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { RoomSessionService } from './room-session.service';
import { UserService } from '../../user/user.service';
import { SocketGateway } from '../../socket/socket.gateway';
import dayjs from 'dayjs';
import { Participant } from '../schema/room-participants.schema';
import { ParticipantListDto } from '../dto/room-participant.dto';
import { JoinRequest } from '../schema/room-join-request.schema';
import { JoinRequestListDto } from '../dto/room-join-request.dto';
import { JoinActionDto } from '../dto/room-join-action.dto';
import { RoomSessionDto } from '../dto/room-session.dto';
import { RoomTokenDto } from '../dto/room-token.dto';

@Injectable()
export class RoomService {
    constructor(
        @InjectModel(Room.name) private roomModel: Model<Room>,
        @InjectModel(Participant.name) private participantModel: Model<Participant>,
        @InjectModel(JoinRequest.name) private joinRequestModel: Model<JoinRequest>,
        private readonly roomSessionService: RoomSessionService,
        private readonly userService: UserService,
        private readonly socketGateway: SocketGateway

    ) { };


    /*
    * Private Function Start
    */

    private async joinHost(hostId: Types.ObjectId, token: string) {

        const room = await this.roomModel.findOne({ token });
        const participant = await this.participantModel.create({
            roomId: room?._id,
            isHost: true,
            userId: hostId,
            joinedAt: dayjs().toDate(),
        });

        const roomSession = await this.roomSessionService.create({
            isHost: true,
            roomId: room?._id,
            userId: hostId,
            token: token,
            participantId: participant._id,
            expiresAt: dayjs().add(15, 'minute').toDate()
        });

        return {
            roomId: room?._id,
            sessionId: roomSession._id
        };
    }

    private async joinParticipant(participantId: Types.ObjectId, token: string) {

        const user = await this.userService.findById(participantId, { firstName: 1, lastName: 1 });
        const room = await this.roomModel.findOne({ token });

        if (!user || !room) return;
        const alreadyRequested = await this.joinRequestModel.findOne({
            userId: user._id,
            roomId: room._id,
            isJoined: false,
        });
        if (alreadyRequested) return;

        const joinRequest = await this.joinRequestModel.create({
            userId: user._id,
            roomId: room?._id,
        });

        return this.socketGateway.handleParticipantJoin(token, {
            _id: joinRequest._id,
            userId: user._id,
            name: `${user?.firstName} ${user?.lastName}`
        });
    }
    /*
    * Private Function end
    */

    /* 
    * Public Function Start
    */
    async create(hostId: Types.ObjectId) {

        const token = uuidv4();
        await this.roomModel.create({
            hostId,
            token
        });

        return {
            token,
            message: 'Room has been created'
        };
    }

    async join(userId: Types.ObjectId, isHost: boolean, token: string) {

        if (isHost) {
            const roomSession = await this.joinHost(userId, token);
            return {
                sessionId: roomSession.sessionId,
                roomId: roomSession.roomId,
                isHost: true,
                token,
                message: "Room joined"
            }
        }

        await this.joinParticipant(userId, token);
        return {
            roomId: "",
            isHost,
            message: "Room Joined Request send"
        }
    }

    async leave(roomSessionDto: RoomSessionDto) {

        const user = await this.userService.findById(roomSessionDto.userId, { firstName: 1, lastName: 1 });

        // Marked Participant Left..
        await this.participantModel.updateOne({ _id: roomSessionDto.participantId }, {
            $set: {
                leftAt: dayjs().toDate(),
            }
        })


        await this.socketGateway.handleParticipantLeave({
            token: roomSessionDto.token,
            name: `${user?.firstName} ${user?.lastName}`,
            participantId: roomSessionDto.participantId
        })

        return {
            message: "Participant Left"
        }
    }


    async acceptInvite(roomId: Types.ObjectId, joinActionDto: JoinActionDto) {

        const user = await this.userService.findById(joinActionDto.userId, { firstName: 1, lastName: 1, _id: 1 });
        if (!user) return;

        const isExist = await this.participantModel.findOne({ joinRequestId: joinActionDto.joinRequestId });
        if (isExist) return;

        const room = await this.roomModel.findById(roomId);
        if (!room) {
            throw new BadRequestException('Room not found');
        }

        const joinRequest = await this.joinRequestModel.findOneAndUpdate(
            { _id: joinActionDto.joinRequestId, isJoined: false },
            { $set: { isJoined: true } },
            { new: true }
        );

        const participant = await this.participantModel.create({
            isHost: false,
            roomId: roomId,
            userId: user._id,
            joinRequestId: joinRequest?._id,
            joinedAt: dayjs().toDate(),
        });


        const roomSession = await this.roomSessionService.create({
            roomId: roomId,
            userId: user._id,
            token: room?.token,
            participantId: participant._id,
            expiresAt: dayjs().add(15, 'minute').toDate()
        });

        return await this.socketGateway.handleAcceptInvite(room.token, {
            roomId: roomId,
            isHost: false,
            userId: user._id,
            name: `${user.firstName} ${user.lastName}`,
            participantId: participant._id,
            sessionId: roomSession._id
        });

    }

    async rejectInvite(joinActionDto: JoinActionDto, roomTokenDto: RoomTokenDto) {
        await this.joinRequestModel.deleteOne({ _id: joinActionDto.joinRequestId });
        return await this.socketGateway.handleRejectInvite(roomTokenDto.token, {
            userId: joinActionDto.userId
        });
    }

    async participants(participantListDto: ParticipantListDto, roomSessionDto: RoomSessionDto) {
        const { roomId } = roomSessionDto;
        const { skip, limit } = participantListDto;
        return await this.participantModel.aggregate([
            {
                $match: {
                    roomId: new Types.ObjectId(roomId),
                    leftAt: null,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    roomId: 1,
                    joinedAt: 1,
                    isHost: 1,
                    name: {
                        $concat: ['$user.firstName', ' ', '$user.lastName'],
                    },
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]);
    }


    async joinRequest(joinRequestListDto: JoinRequestListDto, roomSessionDto: RoomSessionDto) {

        const { skip, limit } = joinRequestListDto;
        const { roomId } = roomSessionDto

        return await this.joinRequestModel.aggregate([
            {
                $match: {
                    roomId: new Types.ObjectId(roomId),
                    isJoined: false
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    name: {
                        $concat: ['$user.firstName', ' ', '$user.lastName'],
                    },
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]);
    }


    async getRoom(token: string) {
        return await this.roomModel.findOne({ token });
    }

    /*
    * 
    * Public Function End
    */



    /**
    * Public DAO Function Start
    */

    async findOne(filter, projection = {}) {
        return await this.roomModel.findOne(filter, projection);
    }



}
