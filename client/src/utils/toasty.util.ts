import toast from "react-hot-toast";

export const toasty = {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast(msg),
    loading: (msg: string) => toast.loading(msg),
    promise: <T>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) =>
        toast.promise(promise, msgs),
};
