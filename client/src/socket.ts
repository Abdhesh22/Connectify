import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if (!socket) {
        const token = localStorage.getItem("access_token");
        socket = io("http://localhost:3000", {
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
