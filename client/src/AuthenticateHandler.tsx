import React, { useEffect, useState } from "react"
import { useStore } from "./components/provider/store.hooks"
import axios, { AxiosError, type AxiosResponse } from "axios";
import type { User } from "./types/user.type";
import { toasty } from "./utils/toasty.util";
import { TOAST_MESSAGE } from "./constants/message.constant";
import Loader from "./components/common-components/Loader";

const AuthenticateHandler = ({ children }: { children: React.ReactNode }) => {

    const { setStore } = useStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSession();
    }, [])

    const fetchSession = async () => {
        try {
            setIsLoading(true);
            if (localStorage.getItem('access_token')) {
                const response: AxiosResponse<User> = await axios.post('/api/auth/session');
                setStore(response.data);
            }
        } catch (error) {
            console.error(error);
            const err = error as AxiosError<{ message?: string }>;
            toasty.error(err?.response?.data?.message || TOAST_MESSAGE.ERROR)
        } finally {
            setIsLoading(false);
        }
    }


    return <>
        {isLoading ? <Loader /> : children}
    </>
}

export default AuthenticateHandler