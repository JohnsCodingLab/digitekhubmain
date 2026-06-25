/**
 * lib/useTheme.ts
 *
 * Global theme context provider and hook.
 * Reads from localStorage on mount and shares state across components
 * reactively without requiring external third-party theme packages.
 */

"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggle: () => void;
    isLight: boolean;
    className: string;
}

const STORAGE_KEY = "digitek-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function CustomThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [theme, setTheme] = useState<Theme>("dark");

    // Read persisted preference on mount only
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
            if (saved === "light" || saved === "dark") {
                setTheme(saved);
            }
        } catch {
            // localStorage unavailable — stay dark
        }
    }, []);

    const toggle = useCallback(() => {
        setTheme((current) => {
            const next = current === "dark" ? "light" : "dark";
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // ignore
            }
            return next;
        });
    }, []);

    const isLight = theme === "light";
    const className = isLight ? "light" : "";

    return (
        <ThemeContext.Provider value={{ theme, toggle, isLight, className }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a CustomThemeProvider");
    }
    return context;
}
