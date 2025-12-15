import type { User } from "./user.type";

export type ApiSuccessResponse = {
    success: boolean;
    message: string;
}

export type ApiUserResponse = {
    message: string;
    user: User
}