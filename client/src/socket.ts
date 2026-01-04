import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "./config/backend";

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if (!socket) {
        const token = localStorage.getItem("access_token");
        socket = io(BACKEND_URL, {
            auth: {
                token
            }
        });
    }
    return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
};
