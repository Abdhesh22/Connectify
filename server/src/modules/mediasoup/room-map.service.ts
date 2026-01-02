import { types } from "mediasoup";
import { MediasoupWorkerService } from "./worker.service";
import { Injectable } from "@nestjs/common";

export const mediaCodecs: types.RtpCodecCapability[] = [{
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
} as types.RtpCodecCapability, {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
} as types.RtpCodecCapability];

@Injectable()
export class MediasoupRoomMapService {
    private rooms = new Map<
        string,
        {
            router: types.Router;
            peers: Map<string, any>;
        }
    >();

    constructor(private workerService: MediasoupWorkerService) { }

    async getRoom(roomId: string): Promise<{
        router: types.Router;
        peers: Map<string, any>;
    }> {
        if (this.rooms.has(roomId)) {
            return this.rooms.get(roomId)!;
        }

        const router = await this.workerService
            .getWorker()
            .createRouter({ mediaCodecs });

        const room = {
            router,
            peers: new Map(),
        };

        this.rooms.set(roomId, room);
        return room;
    }


    removePeer(roomId: string, socketId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.peers.delete(socketId);
        if (room.peers.size === 0) {
            room.router.close();
            this.rooms.delete(roomId);
        }
    }
}