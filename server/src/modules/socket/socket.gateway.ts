import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';
import { Type, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SessionService } from '../session/session.service';
import dayjs from 'dayjs';
import { UserService } from '../user/user.service';
import { USER_STATUS } from 'src/common/constants/user-status.constant';
import { Types } from 'mongoose';

type participantJoinPayload = {
  _id: Types.ObjectId,
  userId: Types.ObjectId,
  name: string
}

type acceptInvitePayload = {
  roomId: Types.ObjectId,
  isHost: boolean,
  userId: Types.ObjectId,
  name: string,
  participantId: Types.ObjectId,
  sessionId: Types.ObjectId
}

type rejectInvitePayload = {
  userId: string
}

type ParticipantLeavePayload = {
  token: string;
  name: string
  participantId: Types.ObjectId;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  // userId -> Set of socketIds
  private onlineUsers = new Map<string, Set<string>>();


  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        throw new UnauthorizedException('Token missing');
      }


      const payload = this.jwtService.verify(token);
      if (!payload) {
        throw new UnauthorizedException('Session expired');
      }

      const session = await this.sessionService.findById(payload.sessionId);
      if (!session) {
        throw new UnauthorizedException('Session expired');
      }

      if (dayjs(session.expiresAt).isBefore(dayjs())) {
        await this.sessionService.deleteById(session._id);
        throw new UnauthorizedException('Session expired');
      }

      const user = await this.userService.findById(
        session.userId,
        { password: 0 }
      );

      if (!user || user.status === USER_STATUS.INACTIVE) {
        await this.sessionService.deleteById(session._id);
        throw new UnauthorizedException('User inactive');
      }

      await this.sessionService.updateOneSession(session._id, {
        expiresAt: dayjs().add(1, 'hour').toDate(),
      });

      const userId = user._id.toString();

      client.data.user = user;
      client.data.userId = userId;
      client.data.sessionId = session._id;

      let sockets = this.onlineUsers.get(userId);

      if (!sockets) {
        sockets = new Set<string>();
        this.onlineUsers.set(userId, sockets);
      }

      client.join(userId);
      sockets.add(client.id);

    } catch (error) {

      client.emit('socket-error', {
        message: 'Unauthorized',
        reason: 'SESSION_TERMINATE',
      });

      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (!userId) return;

    const sockets = this.onlineUsers.get(userId);

    if (sockets) {
      sockets.delete(client.id);

      if (sockets.size === 0) {
        this.onlineUsers.delete(userId);
      }
    }

  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; isHost: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.isHost) {
      client.join(data.roomId);
      client.join(`${data.roomId}:host`);
      return;
    }

    this.server.to(`${data.roomId}:host`).emit('join-request', {
      roomId: data.roomId,
      userId: client.data.userId,
      name: client.data.user.firstName,
    });

  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() data: { roomId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    this.server.to(data.roomId).emit('receive-message', {
      userId: user.id,
      message: data.message,
    });
  }

  handleJoinHost(userId: string, sessionId: Types.ObjectId) {
    this.server.to(userId).emit('host-join-room', { sessionId });
  }

  handleParticipantJoin(roomToken: string, payload: participantJoinPayload) {
    this.server.to(`${roomToken}:host`).emit("join-request", payload)
  }

  async handleAcceptInvite(roomToken: string, payload: acceptInvitePayload) {
    const userId = payload.userId.toString();
    const sockets = this.onlineUsers.get(userId);

    if (!sockets || sockets.size === 0) return;

    this.server.to(userId).emit('invite-accepted', {
      roomToken,
      roomId: payload.roomId,
      isHost: payload.isHost,
      sessionId: payload.sessionId
    });

    this.server.to(roomToken).emit("admit-participant", payload);
  }


  async handleRejectInvite(roomToken: string, payload: rejectInvitePayload) {

    const userId = payload.userId.toString();
    const sockets = this.onlineUsers.get(userId);

    if (!sockets || sockets.size == 0) return;

    this.server.to(userId).emit('invite-rejected', {
      roomToken
    })

  }


  async handleParticipantLeave(participantLeavePayload: ParticipantLeavePayload) {
    this.server.to(participantLeavePayload.token).emit("participant-leave", participantLeavePayload);
  }

}