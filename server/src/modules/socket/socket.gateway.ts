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
import { UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SessionService } from '../session/session.service';
import dayjs from 'dayjs';
import { UserService } from '../user/user.service';
import { USER_STATUS } from 'src/common/constants/user-status.constant';
import { Types } from 'mongoose';
import { MediasoupRoomMapService } from '../mediasoup/room-map.service';

type participantJoinPayload = {
  _id: Types.ObjectId,
  userId: Types.ObjectId,
  name: string
}

type ParticipantAdded = {
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

type ControlPayload = {
  token: string;
  userId: string;
  participantId: Types.ObjectId;
  mic: boolean | undefined;
  camera: boolean | undefined
}

const ROOM = {
  main: (token: string) => `room:${token}`,
  host: (token: string) => `room:${token}:host`,
  user: (token: string, userId: string) => `room:${token}:user:${userId}`,
};



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
    private readonly userService: UserService,
    private readonly mediasoupRoomMap: MediasoupRoomMapService
  ) { }


  afterInit(server: Server) {
    server.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Token missing"));

        const payload = this.jwtService.verify(token);

        const session = await this.sessionService.findById(payload.sessionId);
        if (!session) return next(new Error("Session expired"));

        if (dayjs(session.expiresAt).isBefore(dayjs())) {
          await this.sessionService.deleteById(session._id);
          return next(new Error("Session expired"));
        }

        const user = await this.userService.findById(session.userId, { password: 0 });
        if (!user || user.status === USER_STATUS.INACTIVE) {
          return next(new Error("User inactive"));
        }

        await this.sessionService.updateOneSession(session._id, {
          expiresAt: dayjs().add(1, "hour").toDate(),
        });

        // 🔥 GUARANTEED AVAILABLE EVERYWHERE
        socket.data.userId = user._id.toString();
        socket.data.user = user;
        socket.data.sessionId = session._id;

        next();
      } catch (err) {
        next(new Error("Unauthorized"));
      }
    });
  }


  handleConnection(client: Socket) {
    const userId = client.data.userId;
    let sockets = this.onlineUsers.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.onlineUsers.set(userId, sockets);
    }

    sockets.add(client.id);
    client.join(userId);
  }


  handleDisconnect(client: Socket) {

    const userId = client.data.userId;
    if (!userId) return;

    const sockets = this.onlineUsers.get(userId);
    const roomToken = client.data.sfuRoomToken;

    if (roomToken) {
      this.mediasoupRoomMap.removePeer(roomToken, client.id);
    }

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

    const userId = client.data.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    client.join(ROOM.main(data.roomId));
    client.join(ROOM.user(data.roomId, userId));

    // host specific room
    if (data.isHost) {
      client.join(ROOM.host(data.roomId));
    }
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() data: { roomId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    this.server.to(data.roomId).emit('receive-message', {
      userId: userId,
      message: data.message,
    });
  }

  handleParticipantJoin(roomToken: string, payload: participantJoinPayload) {
    this.server.to(ROOM.host(roomToken)).emit("join-request", payload)
  }

  async handleAcceptInvite(
    roomToken: string,
    payload: ParticipantAdded) {

    const {
      roomId,
      userId
    } = payload;

    if (!roomId || !userId) {
      return;
    }

    this.server.to(ROOM.user(roomToken, userId.toString())).emit('invite-accepted', {
      roomToken,
      roomId: payload.roomId,
      isHost: payload.isHost,
      sessionId: payload.sessionId
    });

    this.server.to(ROOM.main(roomToken)).emit("admit-participant", payload);
  }


  async handleRejectInvite(roomToken: string, payload: rejectInvitePayload) {

    const userId = payload.userId.toString();
    this.server.to(ROOM.user(roomToken, userId)).emit('invite-rejected', {
      roomToken
    })

  }

  async handleParticipantLeave(participantLeavePayload: ParticipantLeavePayload) {
    this.server.to(ROOM.main(participantLeavePayload.token)).emit("participant-leave", participantLeavePayload);
  }

  async handleControlChange(payload: ControlPayload) {
    this.server.to(ROOM.main(payload.token)).emit('control-change', payload);
  }

  async handleHostJoin(roomToken: string, payload: ParticipantAdded) {
    this.server.to(ROOM.main(roomToken)).emit("host-join", payload);
  }

  //Sfu related code..
  @SubscribeMessage('sfu:join')
  async handleSfuJoin(
    @MessageBody() { roomToken },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) throw new UnauthorizedException();

    const room = await this.mediasoupRoomMap.getRoom(roomToken);

    room.peers.set(client.id, {
      userId,
      transports: new Map(),
      producers: new Map(),
      consumers: new Map(),
    });

    return {
      rtpCapabilities: room.router.rtpCapabilities,
    };
  }


  @SubscribeMessage('sfu:create-transport')
  async createTransport(
    @MessageBody() { roomToken },
    @ConnectedSocket() socket: Socket,
  ) {
    const room = await this.mediasoupRoomMap.getRoom(roomToken);

    const peer = room.peers.get(socket.id);
    if (!peer) {
      throw new Error('SFU peer not found. Call sfu:join first.');
    }

    const transport = await room.router.createWebRtcTransport({
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: process.env.PUBLIC_IP || '127.0.0.1',
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    peer.transports.set(transport.id, transport);

    transport.on('dtlsstatechange', state => {
      if (state === 'closed') transport.close();
    });

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }


  @SubscribeMessage('sfu:connect-transport')
  async connectTransport(
    @MessageBody()
    {
      roomToken,
      transportId,
      dtlsParameters,
    }: {
      roomToken: string;
      transportId: string;
      dtlsParameters: any;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const room = await this.mediasoupRoomMap.getRoom(roomToken);

    const peer = room.peers.get(socket.id);
    if (!peer) {
      throw new Error('SFU peer not found. Call sfu:join first.');
    }

    const transport = peer.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport not found: ${transportId}`);
    }

    await transport.connect({ dtlsParameters });
  }



  @SubscribeMessage('sfu:produce')
  async produce(
    @MessageBody()
    {
      roomToken,
      transportId,
      kind,
      rtpParameters,
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const room = await this.mediasoupRoomMap.getRoom(roomToken);
    const peer = room.peers.get(socket.id);
    if (!peer) throw new Error('Peer not found');

    const transport = peer.transports.get(transportId);
    if (!transport) throw new Error('Transport not found');

    const producer = await transport.produce({
      kind,
      rtpParameters,
    });

    peer.producers.set(producer.id, producer);

    // 🔥 VERY IMPORTANT: notify other peers
    for (const [otherSocketId] of room.peers) {
      if (otherSocketId !== socket.id) {
        this.server.to(otherSocketId).emit('sfu:new-producer', {
          producerId: producer.id,
          userId: peer.userId,
          kind,
        });
      }
    }

    producer.on('transportclose', () => {
      peer.producers.delete(producer.id);
    });

    producer.on('close', () => {
      peer.producers.delete(producer.id);
    });

    return { producerId: producer.id };
  }



  @SubscribeMessage('sfu:consume')
  async consume(
    @MessageBody()
    {
      roomToken,
      transportId,
      producerId,
      rtpCapabilities,
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const room = await this.mediasoupRoomMap.getRoom(roomToken);
    const peer = room.peers.get(socket.id);
    if (!peer) throw new Error('Peer not found');

    if (!room.router.canConsume({ producerId, rtpCapabilities })) {
      throw new Error('Cannot consume');
    }

    const transport = peer.transports.get(transportId);
    if (!transport) throw new Error('Transport not found');

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });

    peer.consumers.set(consumer.id, consumer);

    consumer.on('transportclose', () => {
      peer.consumers.delete(consumer.id);
    });

    consumer.on('producerclose', () => {
      peer.consumers.delete(consumer.id);
      socket.emit('sfu:producer-closed', { producerId });
    });

    return {
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  @SubscribeMessage('sfu:resume-consumer')
  async resumeConsumer(
    @MessageBody() { roomToken, consumerId },
    @ConnectedSocket() socket: Socket,
  ) {
    const room = await this.mediasoupRoomMap.getRoom(roomToken);
    const peer = room.peers.get(socket.id);

    const consumer = peer?.consumers.get(consumerId);
    if (!consumer) return;

    await consumer.resume();
  }

}