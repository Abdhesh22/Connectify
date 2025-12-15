import React, { useMemo, useState } from "react";
import { StoreContext } from "./store.context";
import type { StoreContextType } from "../../types/store-context.type";
import type { User } from "../../types/user.type";

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [store, setStore] = useState<User | null>(null);

    const value: StoreContextType = useMemo(() => ({
        store,
        setStore,
        isAuthenticated: !!store,
    }), [store]);

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};