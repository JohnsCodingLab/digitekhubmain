/**
 * lib/useTheme.ts
 *
 * Minimal theme hook — no next-themes needed.
 *
 * Reads from localStorage on mount so the user's preference
 * persists across sessions. Writes back on toggle. The
 * "light" class is applied to the PAGE WRAPPER (not <html>)
 * so only the opted-in pages (Shop, Contact, Our Plans) are
 * affected — the homepage, Navbar, and Footer are untouched.
 *
 * Usage in a page:
 *   const { theme, toggle, className } = useTheme();
 *   return <div className={className}>...</div>
 *
 * className resolves to "light" or "" — the page's root div
 * carries the class, and CSS under .light applies inside it.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "digitek-theme";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>("dark"); // default dark, no flash

    // Read persisted preference on mount only (client-side)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
            if (saved === "light" || saved === "dark") {
                setTheme(saved);
            }
        } catch {
            // localStorage unavailable (private mode etc.) — stay dark
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

    return {
        theme,
        toggle,
        isLight: theme === "light",
        /** Apply this to the root <div> of any themed page */
        className: theme === "light" ? "light" : "",
    };
}
