import axios, { AxiosError } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { toasty } from "../../../utils/toasty.util";
import { TOAST_MESSAGE } from "../../../constants/message.constant";
import VideoTile from "./VideoTile";
import { connectSocket } from "../../../socket";
import { useStore } from "../../provider/store.hooks";
import type { Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";

/* ================= TYPES ================= */

type VideoParticipant = {
    id: string;
    userId: string;
    name: string;
    isHost: boolean;
    mic: boolean;
    camera: boolean;
    stream?: MediaStream;
};

type Props = {
    mic: boolean;
    camera: boolean;
};

type ParticipantPeople = {
    userId: string;
    name: string;
    isHost: boolean;
    mic: boolean;
    camera: boolean;
    _id: string;
};

/* ================= COMPONENT ================= */

const ParticipantWidget: React.FC<Props> = ({ mic, camera }) => {
    const { store } = useStore();
    const { token } = useParams<{ token: string }>();

    /* ---------- REFS ---------- */

    const socketRef = useRef<Socket | null>(null);
    const deviceRef = useRef<mediasoupClient.Device | null>(null);

    const sendTransportRef = useRef<any>(null);
    const recvTransportRef = useRef<any>(null);

    const audioElRef = useRef<HTMLAudioElement | null>(null);

    const audioStreamRef = useRef<MediaStream | null>(null);
    const videoStreamRef = useRef<MediaStream | null>(null);

    const audioProducerRef = useRef<any>(null);
    const videoProducerRef = useRef<any>(null);

    const audioMixStreamRef = useRef<MediaStream>(new MediaStream());

    const recvTransportReadyRef = useRef<Promise<void> | null>(null);
    const resolveRecvReadyRef = useRef<(() => void) | null>(null);

    const consumedProducersRef = useRef<Set<string>>(new Set());


    /* ---------- STATE ---------- */

    const [participants, setParticipants] = useState<VideoParticipant[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [loading, setLoading] = useState(false);

    const limit = 20;

    /* ================= GRID ================= */

    const getGridClass = () => {
        if (participants.length === 1) return "grid-one";
        if (participants.length === 2) return "grid-two";
        return "grid-multi";
    };

    /* ================= FETCH PARTICIPANTS ================= */

    const fetchParticipants = useCallback(
        async (isScroll: boolean) => {
            if (!token || loading) return;

            setLoading(true);
            try {
                const currentSkip = isScroll ? skip : 0;

                const { data } = await axios.get("/api/room/participants", {
                    params: { skip: currentSkip, limit },
                });

                const mapped: VideoParticipant[] = data.map((p: ParticipantPeople) => ({
                    id: p._id,
                    userId: p.userId,
                    name: p.name,
                    isHost: p.isHost,
                    mic: p.mic,
                    camera: p.camera,
                }));

                setParticipants(prev => {
                    const map = new Map<string, VideoParticipant>();
                    prev.forEach(p => map.set(p.userId, p));
                    mapped.forEach(p =>
                        map.set(p.userId, { ...map.get(p.userId), ...p })
                    );
                    return Array.from(map.values());
                });

                setSkip(currentSkip + mapped.length);
                setHasMore(mapped.length === limit);
            } catch (error) {
                const err = error as AxiosError<{ message?: string }>;
                toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR);
            } finally {
                setLoading(false);
            }
        },
        [token, skip, loading]
    );

    useEffect(() => {
        if (!token) return;
        setSkip(0);
        fetchParticipants(false);
    }, [token]);

    /* ================= SFU INIT ================= */


    useEffect(() => {
        if (!token) return;

        const socket = connectSocket();
        socketRef.current = socket;

        let joined = false;

        const onConnect = async () => {
            if (joined) return;
            joined = true;

            console.log("✅ Socket connected, joining SFU room");
            socket.emit(
                "sfu:join",
                { roomToken: token },
                async ({ rtpCapabilities, existingProducers }) => {

                    deviceRef.current = new mediasoupClient.Device();
                    await deviceRef.current.load({
                        routerRtpCapabilities: rtpCapabilities,
                    });

                    await createSendTransport();
                    await createRecvTransport();

                    // 🔥 CONSUME EXISTING PRODUCERS (screen share, cam, audio)
                    for (const p of existingProducers) {
                        consume(p.producerId, p.userId);
                    }
                }
            );


            socket.on("sfu:new-producer", ({ producerId, userId }) => {
                consume(producerId, userId);
            });

            socket.on("sfu:producer-paused", ({ producerId, userId, kind }) => {

                // 🎤 AUDIO PAUSED → REMOVE AUDIO TRACK
                if (kind === "audio") {
                    audioMixStreamRef.current.getTracks().forEach(track => {
                        if (track.id === producerId) {
                            audioMixStreamRef.current.removeTrack(track);
                        }
                    });
                }

                // 🎥 VIDEO PAUSED → REMOVE STREAM → AVATAR
                if (kind === "video") {
                    setParticipants(prev =>
                        prev.map(p =>
                            p.userId === userId
                                ? { ...p, stream: undefined }
                                : p
                        )
                    );
                }
            });


            socket.on("sfu:producer-resumed", ({ producerId, userId, kind }) => {

                // 🎤 AUDIO RESUME → CONSUME AGAIN
                if (kind === "audio") {
                    consume(producerId, userId);
                }

                // 🎥 VIDEO RESUME → CONSUME AGAIN
                if (kind === "video") {
                    consume(producerId, userId);
                }
            });



        };

        // ✅ Handle both cases
        if (socket.connected) {
            onConnect();
        } else {
            socket.once("connect", onConnect);
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("sfu:new-producer");

            // 🔴 CLOSE PRODUCERS (VERY IMPORTANT)
            audioProducerRef.current?.close();
            videoProducerRef.current?.close();
            audioProducerRef.current = null;
            videoProducerRef.current = null;

            // 🔴 STOP HARDWARE (RELEASE MIC & CAMERA)
            audioStreamRef.current?.getTracks().forEach(t => t.stop());
            videoStreamRef.current?.getTracks().forEach(t => t.stop());
            audioStreamRef.current = null;
            videoStreamRef.current = null;

            // 🔴 CLOSE TRANSPORTS
            sendTransportRef.current?.close();
            recvTransportRef.current?.close();
            sendTransportRef.current = null;
            recvTransportRef.current = null;

            joined = false;
        };
    }, [token]);


    /* ================= TRANSPORTS ================= */

    const createSendTransport = async () => {
        const socket = socketRef.current!;
        const device = deviceRef.current!;

        socket.emit("sfu:create-transport", { roomToken: token }, params => {
            console.log("line 165");
            sendTransportRef.current = device.createSendTransport(params);

            sendTransportRef.current.on("connect", ({ dtlsParameters }: any, cb: any) => {
                console.log("line 170");
                socket.emit("sfu:connect-transport", {
                    roomToken: token,
                    transportId: sendTransportRef.current.id,
                    dtlsParameters,
                });
                cb();
            });

            sendTransportRef.current.on("produce", ({ kind, rtpParameters }: any, cb: any) => {
                console.log("line 180");
                socket.emit(
                    "sfu:produce",
                    { roomToken: token, transportId: sendTransportRef.current.id, kind, rtpParameters },
                    ({ producerId }: any) => cb({ id: producerId })
                );
            });
        });
    };
    const createRecvTransport = async () => {
        const socket = socketRef.current!;
        const device = deviceRef.current!;

        recvTransportReadyRef.current = new Promise<void>(resolve => {
            resolveRecvReadyRef.current = resolve;
        });

        socket.emit("sfu:create-transport", { roomToken: token }, params => {
            recvTransportRef.current = device.createRecvTransport(params);

            recvTransportRef.current.on(
                "connect",
                ({ dtlsParameters }: any, cb: any) => {
                    socket.emit("sfu:connect-transport", {
                        roomToken: token,
                        transportId: recvTransportRef.current.id,
                        dtlsParameters,
                    });
                    cb();
                }
            );

            // 🔥 MARK AS READY
            resolveRecvReadyRef.current?.();
        });
    };


    /* ================= PRODUCER SYNC ================= */





    /* ================= TOGGLE HANDLER ================= */
    useEffect(() => {
        if (!sendTransportRef.current) return;

        const syncAudio = async () => {
            // 🟢 MIC ON
            if (mic) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                    video: false,
                });

                const track = stream.getAudioTracks()[0];
                audioStreamRef.current = stream;

                if (!audioProducerRef.current) {
                    audioProducerRef.current =
                        await sendTransportRef.current.produce({
                            track,
                            codecOptions: { opusFec: true, opusDtx: true },
                        });
                } else {
                    await audioProducerRef.current.replaceTrack({ track });
                    await audioProducerRef.current.resume();
                }

                socketRef.current?.emit("sfu:resume-producer", {
                    roomToken: token,
                    producerId: audioProducerRef.current.id,
                });
            }

            // 🔴 MIC OFF
            else {
                if (audioProducerRef.current) {
                    await audioProducerRef.current.pause();

                    socketRef.current?.emit("sfu:pause-producer", {
                        roomToken: token,
                        producerId: audioProducerRef.current.id,
                    });
                }

                audioStreamRef.current?.getTracks().forEach(t => t.stop());
                audioStreamRef.current = null;
            }
        };

        syncAudio();
    }, [mic]);




    useEffect(() => {
        if (!sendTransportRef.current) return;

        const syncVideo = async () => {
            // 🟢 CAMERA ON
            if (camera) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });

                const track = stream.getVideoTracks()[0];
                videoStreamRef.current = stream;

                if (!videoProducerRef.current) {
                    videoProducerRef.current =
                        await sendTransportRef.current.produce({ track });
                } else {
                    await videoProducerRef.current.replaceTrack({ track });
                    await videoProducerRef.current.resume();
                }

                socketRef.current?.emit("sfu:resume-producer", {
                    roomToken: token,
                    producerId: videoProducerRef.current.id,
                });

                // local preview
                setParticipants(prev =>
                    prev.map(p =>
                        p.userId === store?.userId
                            ? { ...p, stream }
                            : p
                    )
                );
            }

            // 🔴 CAMERA OFF
            else {
                if (videoProducerRef.current) {
                    await videoProducerRef.current.pause();

                    socketRef.current?.emit("sfu:pause-producer", {
                        roomToken: token,
                        producerId: videoProducerRef.current.id,
                    });
                }

                videoStreamRef.current?.getTracks().forEach(t => t.stop());
                videoStreamRef.current = null;

                setParticipants(prev =>
                    prev.map(p =>
                        p.userId === store?.userId
                            ? { ...p, stream: undefined }
                            : p
                    )
                );
            }
        };

        syncVideo();
    }, [camera]);




    const consume = async (producerId: string, userId: string) => {

        if (consumedProducersRef.current.has(producerId)) return;
        consumedProducersRef.current.add(producerId);

        // ⛔ WAIT until recv transport exists
        if (recvTransportReadyRef.current) {
            await recvTransportReadyRef.current;
        }

        const socket = socketRef.current!;
        const device = deviceRef.current!;
        const transport = recvTransportRef.current;

        if (!transport) {
            console.warn("Recv transport not ready yet");
            consumedProducersRef.current.delete(producerId);
            return;
        }

        socket.emit(
            "sfu:consume",
            {
                roomToken: token,
                transportId: transport.id,
                producerId,
                rtpCapabilities: device.rtpCapabilities,
            },
            async (params: any) => {
                const consumer = await transport.consume(params);

                const stream = new MediaStream([consumer.track]);

                /* ================= AUDIO ================= */
                if (consumer.kind === "audio") {
                    audioMixStreamRef.current.addTrack(consumer.track);

                    if (audioElRef.current) {
                        audioElRef.current.srcObject = audioMixStreamRef.current;
                        try {
                            await audioElRef.current.play();
                        } catch { }
                    }
                }

                /* ================= VIDEO ================= */
                if (consumer.kind === "video") {
                    setParticipants(prev =>
                        prev.map(p =>
                            p.userId === userId ? { ...p, stream } : p
                        )
                    );
                }

                // 🔥 PRODUCER CLOSED (USER LEFT / STREAM DESTROYED)
                consumer.on("producerclose", () => {

                    // audio cleanup
                    if (consumer.kind === "audio") {
                        audioMixStreamRef.current.removeTrack(consumer.track);
                    }

                    // video cleanup → avatar
                    if (consumer.kind === "video") {
                        setParticipants(prev =>
                            prev.map(p =>
                                p.userId === userId
                                    ? { ...p, stream: undefined }
                                    : p
                            )
                        );
                    }

                    consumedProducersRef.current.delete(producerId);
                });

                socket.emit("sfu:resume-consumer", {
                    roomToken: token,
                    consumerId: consumer.id,
                });
            }
        );
    };


    /* ================= UI ================= */

    if (loading && participants.length === 0) {
        return <p className="text-center">Loading participants...</p>;
    }

    if (!loading && participants.length === 0) {
        return <p className="text-center">No participants</p>;
    }

    return (
        <div id="video-grid-scroll" className="video-grid-scroll" style={{ height: "100%" }}>
            <InfiniteScroll
                dataLength={participants.length}
                next={() => fetchParticipants(true)}
                hasMore={hasMore}
                loader={<div className="video-loading">Loading more...</div>}
                scrollableTarget="video-grid-scroll"
            >
                <div className={`participant-grid enhance-ui ${getGridClass()}`}>
                    {participants.map(p => (
                        <VideoTile key={p.id} participant={p} />
                    ))}
                </div>
            </InfiniteScroll>
            <audio
                ref={audioElRef}
                autoPlay
                playsInline
            />
        </div>
    );
};

export default ParticipantWidget;