import type React from "react";
import { toasty } from "../../../utils/toasty.util";
import axios, { AxiosError, type AxiosResponse } from "axios";
import { TOAST_MESSAGE } from "../../../constants/message.constant";
import { useNavigate } from "react-router-dom";


type createRoomAxiosResponse = {
    token?: string;
    message: string
}

const Landing: React.FC = () => {

    const navigate = useNavigate();

    const createRoom = async () => {
        try {
            const response: AxiosResponse<createRoomAxiosResponse> = await axios.post("/api/room");
            toasty.success(response.data.message);
            navigate(`/room/${response.data.token}`);
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR)
        }
    }

    return (
        <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center">

            <h2 className="fw-bold mb-2">Conversations made simple for everyone</h2>
            <p className="text-muted mb-4">
                Connect, share, and be present with your people — anytime, anywhere.
            </p>

            <button className="btn btn-primary btn-lg d-flex align-items-center gap-2 px-4 py-3" onClick={() => createRoom()}>
                <i className="bi bi-plus-lg"></i>
                Create Room
            </button>

        </div>
    );
};

export default Landing;