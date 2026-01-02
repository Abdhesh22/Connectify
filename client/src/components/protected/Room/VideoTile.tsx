import React, { useEffect, useRef } from "react";
import { useStore } from "../../provider/store.hooks";

type VideoParticipant = {
    id: string;
    userId: string;
    name: string;
    isHost: boolean;
    mic: boolean;
    camera: boolean;
    stream?: MediaStream;
};

type VideoTileProps = {
    participant: VideoParticipant;
};

const VideoTile: React.FC<VideoTileProps> = ({ participant }) => {
    const { store } = useStore();
    const videoRef = useRef<HTMLVideoElement>(null);

    /* ---------------- VIDEO ATTACH ---------------- */

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl || !participant.stream) return;

        videoEl.srcObject = participant.stream;

        const play = async () => {
            try {
                await videoEl.play();
            } catch {
                // autoplay fallback
                videoEl.muted = true;
                await videoEl.play();
            }
        };

        play();

        return () => {
            videoEl.srcObject = null;
        };
    }, [participant.stream]);



    /* ---------------- RENDER ---------------- */

    return (
        <div className="video-tile modern-tile">
            {/* ================= VIDEO / AVATAR ================= */}
            <div className="video-content">
                {participant.stream ? (
                    <div className="camera-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted={store?.userId === participant.userId}
                            className="camera-video"
                        />
                    </div>
                ) : (
                    <div className="avatar-wrapper">
                        <div className="avatar-circle">{participant.name.charAt(0).toUpperCase()}</div>
                    </div>
                )}
            </div>

            {/* ================= FOOTER ================= */}
            <div className="video-footer">
                <div className="video-name">
                    {store?.userId == participant.userId ? "You" : participant.name}
                </div>

                <span
                    className={`status-badge ${participant.mic ? "mic-on" : "mic-off"
                        }`}
                >
                    {participant.mic ? "Mic On" : "Mic Off"}
                </span>
            </div>
        </div>
    );
};

export default VideoTile;