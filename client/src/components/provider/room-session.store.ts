let roomSessionToken: string | null = null;
export const setRoomSessionToken = (token: string | null) => {
    roomSessionToken = token;
};
export const getRoomSessionToken = () => roomSessionToken;
export const clearRoomSessionToken = () => {
    roomSessionToken = null;
};