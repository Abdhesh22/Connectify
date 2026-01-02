import { Injectable } from "@nestjs/common";
import {
    types,
    createWorker
} from "mediasoup";

@Injectable()
export class MediasoupWorkerService {
    worker: types.Worker;

    async init() {
        if (this.worker) return;

        this.worker = await createWorker({
            rtcMinPort: 2000,
            rtcMaxPort: 2020,
        });

        this.worker.on('died', () => process.exit(1));
    }

    getWorker() {
        return this.worker;
    }
}
