import axios from "axios";

axios.defaults.baseURL = window.location.origin;
axios.defaults.headers['Content-Type'] = 'application/json';

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers?.set("Authorization", `Bearer ${token}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => {
        const token = response.headers["authorization"];
        if (token) {
            localStorage.setItem("access_token", token.replace("Bearer ", ""));
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // localStorage.removeItem("access_token");
        }
        return Promise.reject(error);
    }
);