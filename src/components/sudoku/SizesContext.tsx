import React, { createContext, useContext, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { calculateSizes } from "./theme";

type Sizes = ReturnType<typeof calculateSizes>;

const SizesContext = createContext<Sizes>(calculateSizes());

export const SizesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sizes, setSizes] = useState<Sizes>(calculateSizes());

    useEffect(() => {
        const subscription = Dimensions.addEventListener("change", () => {
            setSizes(calculateSizes());
        });
        return () => subscription?.remove();
    }, []);

    return <SizesContext.Provider value={sizes}>{children}</SizesContext.Provider>;
};

export const useSizes = () => useContext(SizesContext);