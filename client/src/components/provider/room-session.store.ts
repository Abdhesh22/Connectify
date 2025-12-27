export const setRoomSessionToken = (token: string | null) => {
    if (token) {
        sessionStorage.setItem("roomSessionToken", token);
    }
};

export const getRoomSessionToken = () => sessionStorage.getItem("roomSessionToken");
export const clearRoomSessionToken = () => {
    sessionStorage.clear();
};