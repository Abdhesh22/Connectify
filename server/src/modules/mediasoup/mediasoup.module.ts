import { Module, OnModuleInit } from '@nestjs/common';
import { MediasoupWorkerService } from './worker.service';
import { MediasoupRoomMapService } from './room-map.service';

@Module({
  providers: [
    MediasoupWorkerService,
    MediasoupRoomMapService,
  ],
  exports: [
    MediasoupWorkerService,
    MediasoupRoomMapService,
  ],
})
export class MediasoupModule implements OnModuleInit {
  constructor(
    private readonly workerService: MediasoupWorkerService,
  ) { }

  async onModuleInit() {
    await this.workerService.init();
    console.log('✅ Mediasoup worker initialized');
  }
}
