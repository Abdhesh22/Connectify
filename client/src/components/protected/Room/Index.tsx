import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Room from "./Room";
import { toasty } from "../../../utils/toasty.util";
import axios, { AxiosError, type AxiosResponse } from "axios";
import { TOAST_MESSAGE } from "../../../constants/message.constant";
import Loader from "../../common-components/Loader";
import { connectSocket } from "../../../socket";
import { getRoomSessionToken, setRoomSessionToken } from "../../provider/room-session.store";

type RoomAuthResponse = {
    sessionId: string | null;
    isHost: boolean;
    isJoined?: boolean;
}

type InviteAcceptedResponse = {
    isHost: boolean;
    sessionId: string;
}

type RoomJoinResponse = {
    sessionId: string;
    message: string;
    isHost: boolean;
}


const Index: React.FC = () => {
    const { token } = useParams<{ token: string }>();

    const [roomSession, setRoomSession] = useState<RoomAuthResponse>();
    const [joinButtonMessage, setJoinButtonMessage] = useState<string>();

    useEffect(() => {
        const socket = connectSocket();

        if (!socket) return;

        const onConnect = () => {

            socket.emit("join-room", {
                roomId: token,
                isHost: roomSession?.isHost,
            });

            socket.on("invite-accepted", (data: InviteAcceptedResponse) => {

                setRoomSession({
                    sessionId: data.sessionId,
                    isHost: false,
                    isJoined: true,
                });

                setRoomSessionToken(data.sessionId);
                setJoinButtonMessage("");
            });

            socket.on("invite-rejected", () => {
                setJoinButtonMessage("Join request rejected by the host");
            });
        };

        // ✅ If already connected, call directly
        if (socket.connected) {
            onConnect();
        } else {
            socket.once("connect", onConnect);
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("invite-accepted");
            socket.off("invite-rejected");
        };
    }, [roomSession]);


    const join = async () => {
        try {

            const response: AxiosResponse<RoomJoinResponse> = await axios.post(`/api/room/join/${token}`);
            if (response.data.isHost) {
                setRoomSessionToken(response.data.sessionId);
                setRoomSession({
                    sessionId: response.data.sessionId,
                    isHost: true,
                    isJoined: true
                });
            } else {
                setJoinButtonMessage("Waiting for host approval…");
            }

        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR);
        }
    }

    const handleLeaveRoom = async () => {
        try {
            await axios.post(`/api/room/leave`);
            setRoomSession({
                sessionId: null,
                isHost: false
            });
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR)
        }
    }

    useEffect(() => {
        if (!token) return;
        if (!roomSession?.isJoined) return;

        const autoLeave = () => {
            const payload = {
                sessionId: localStorage.getItem("access_token"),
                roomSessionId: getRoomSessionToken(),
                source: "AUTO_LEAVE",
                ts: Date.now(),
            };

            navigator.sendBeacon(
                "/api/room/auto-leave",
                new Blob([JSON.stringify(payload)], {
                    type: "application/json",
                })
            );
        };

        // Fires on reload & tab close
        window.addEventListener("beforeunload", autoLeave);

        // Needed for Safari / iOS (tab close / navigation away)
        const handlePageHide = (e: PageTransitionEvent) => {
            // Ignore bfcache restores
            if (!e.persisted) {
                autoLeave();
            }
        };

        window.addEventListener("pagehide", handlePageHide);

        return () => {
            window.removeEventListener("beforeunload", autoLeave);
            window.removeEventListener("pagehide", handlePageHide);
        };
    }, [token, roomSession?.isJoined]);


    return (
        <>
            {roomSession?.sessionId ?
                <Room isHost={roomSession.isHost} handleLeaveRoom={handleLeaveRoom} /> :
                <div className="d-flex justify-content-center align-items-center vh-100">
                    {joinButtonMessage?.length ? <Loader text={joinButtonMessage} /> : <button type="button" className="btn btn-primary btn-lg" onClick={() => join()}>
                        Join Now
                    </button >}
                </div >}
        </>
    );
};

export default Index;
