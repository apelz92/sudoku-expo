import React, { createContext, useContext, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { calculateSizes } from "./theme";

type Sizes = ReturnType<typeof calculateSizes>;

const ResponsiveContext = createContext<Sizes>(calculateSizes());

export const ResponsiveDesign: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sizes, setSizes] = useState<Sizes>(calculateSizes());

    useEffect(() => {
        const subscription = Dimensions.addEventListener("change", () => {
            setSizes(calculateSizes());
        });
        return () => subscription?.remove();
    }, []);

    return <ResponsiveContext.Provider value={sizes}>{children}</ResponsiveContext.Provider>;
};

export const useSizes = () => useContext(ResponsiveContext);
