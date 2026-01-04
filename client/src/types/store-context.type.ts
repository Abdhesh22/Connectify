import type { User } from "./user.type";

export type StoreContextType = {
    store: User | null;
    setStore: React.Dispatch<React.SetStateAction<User | null>>;
    isAuthenticated: boolean;
}