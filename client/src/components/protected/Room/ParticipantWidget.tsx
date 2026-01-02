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
                async ({ rtpCapabilities }) => {
                    console.log("line 134");

                    deviceRef.current = new mediasoupClient.Device();
                    await deviceRef.current.load({
                        routerRtpCapabilities: rtpCapabilities,
                    });

                    // ensure device is ready before transports
                    await Promise.resolve();

                    await createSendTransport();
                    await createRecvTransport();
                }
            );

            socket.on("sfu:new-producer", ({ producerId, userId }) => {
                console.log("line 147");
                consume(producerId, userId);
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

            audioProducerRef.current?.close();
            videoProducerRef.current?.close();
            sendTransportRef.current?.close();
            recvTransportRef.current?.close();

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

        socket.emit("sfu:create-transport", { roomToken: token }, params => {
            console.log("line 195");
            recvTransportRef.current = device.createRecvTransport(params);

            recvTransportRef.current.on("connect", ({ dtlsParameters }: any, cb: any) => {
                console.log("line 199");
                socket.emit("sfu:connect-transport", {
                    roomToken: token,
                    transportId: recvTransportRef.current.id,
                    dtlsParameters,
                });
                cb();
            });
        });
    };


    /* ================= PRODUCER SYNC ================= */

    const syncProducers = async () => {
        if (!sendTransportRef.current) return;



        /* ================= AUDIO ================= */
        if (mic) {
            if (!audioStreamRef.current) {
                audioStreamRef.current = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        channelCount: 1,
                        sampleRate: 48000,
                        sampleSize: 16,
                    },
                    video: false,
                });
            }

            const audioTrack = audioStreamRef.current.getAudioTracks()[0];

            if (!audioProducerRef.current) {
                audioProducerRef.current =
                    await sendTransportRef.current.produce({
                        track: audioTrack,
                        codecOptions: {
                            opusFec: true,
                            opusDtx: true,
                            opusPtime: 20,
                            opusMaxPlaybackRate: 48000,
                        },
                    });

                // 🔥 IMPORTANT: set stable bitrate
                audioProducerRef.current.setMaxBitrate?.(64000);
            }

            // ✅ SAFE MUTE / UNMUTE
            audioTrack.enabled = true;
        } else {
            // ❌ DO NOT pause producer
            audioStreamRef.current?.getAudioTracks().forEach(track => {
                track.enabled = false;
            });
        }


        /* ================= VIDEO ================= */

        if (camera) {
            videoStreamRef.current = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });

            const videoTrack = videoStreamRef.current.getVideoTracks()[0];

            if (videoProducerRef.current) {
                videoProducerRef.current.close();
                videoProducerRef.current = null;
            }

            videoProducerRef.current =
                await sendTransportRef.current.produce({ track: videoTrack });

            // local preview
            setParticipants(prev =>
                prev.map(p =>
                    p.userId === store?.userId
                        ? { ...p, stream: videoStreamRef.current! }
                        : p
                )
            );
        } else {
            if (videoProducerRef.current) {
                videoProducerRef.current.close();
                videoProducerRef.current = null;
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




    /* ================= TOGGLE HANDLER ================= */

    useEffect(() => {
        syncProducers();
    }, [mic, camera]);

    /* ================= CONSUME ================= */

    const consume = async (producerId: string, userId: string) => {
        const socket = socketRef.current!;
        const device = deviceRef.current!;
        const transport = recvTransportRef.current;

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

                if (consumer.kind === "audio") {
                    // 🔥 AUDIO PLAYBACK FIX
                    if (audioElRef.current) {
                        audioElRef.current.srcObject = stream;

                        try {
                            await audioElRef.current.play();
                        } catch (e) {
                            console.warn("Audio autoplay blocked", e);
                        }
                    }
                }

                if (consumer.kind === "video") {
                    setParticipants(prev =>
                        prev.map(p =>
                            p.userId === userId ? { ...p, stream } : p
                        )
                    );
                }

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