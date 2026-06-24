/**
 * components/common/ThemeProvider.tsx
 *
 * Custom context provider that manages the hybrid theme system.
 * By using React context instead of next-themes, we avoid modifying
 * the global <html> element, keeping the Navbar, Footer, and Homepage
 * permanently dark while allowing opted-in sub-pages to change.
 */

"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

export type Theme = "dark" | "light";
const STORAGE_KEY = "digitek-theme";

interface ThemeContextType {
    theme: Theme;
    isLight: boolean;
    toggle: () => void;
    pageClassName: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
            if (saved === "light" || saved === "dark") {
                setTheme(saved);
            }
        } catch {
            // Stay dark if localStorage is blocked (e.g., private browsing)
        }
    }, []);

    const toggle = useCallback(() => {
        setTheme((current) => {
            const next = current === "dark" ? "light" : "dark";
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Ignore
            }
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({
            theme,
            isLight: theme === "light",
            toggle,
            // This class is applied ONLY to the root container of opted-in sub-pages
            pageClassName: theme === "light" ? "light-mode-active" : "",
        }),
        [theme, toggle],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error(
            "useTheme must be executed within an active <ThemeProvider /> context stack.",
        );
    }
    return context;
}
