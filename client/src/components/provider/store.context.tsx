import { createContext } from "react";
import type { StoreContextType } from "../../types/store-context.type";

export const StoreContext = createContext<StoreContextType | null>(null);