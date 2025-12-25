import axios, {
    AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig
} from "axios";
import { getRoomSessionToken } from "./components/provider/room-session.store";

/* ---------------- AXIOS DEFAULTS ---------------- */

axios.defaults.baseURL = window.location.origin;
axios.defaults.headers.common["Content-Type"] = "application/json";

/* ---------------- REQUEST INTERCEPTOR ---------------- */

axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }

        if (config.url?.startsWith("/api/room")) {
            const roomSessionToken = getRoomSessionToken();
            if (roomSessionToken) {
                config.headers.set("X-Room-Session", roomSessionToken);
            }
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */
axios.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        const token = response.headers["authorization"] as string | undefined;
        if (token) {
            localStorage.setItem("access_token", token.replace("Bearer ", ""));
        }
        return response;
    },
    (error: AxiosError<{ reason?: string }>) => {
        if (
            error.response?.status === 401 &&
            error.response.data?.reason === "SESSION_TERMINATE"
        ) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axios;