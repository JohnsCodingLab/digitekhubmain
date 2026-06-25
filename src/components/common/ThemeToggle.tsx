"use client";

import * as React from "react";
import { FaSun, FaMoon } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { toggle, isLight } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className={`w-9 h-9 rounded-md bg-neutral-900/40 border border-neutral-800 ${className}`}
                aria-hidden="true"
            />
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={
                isLight
                    ? "Switch to enterprise dark mode"
                    : "Switch to corporate light mode"
            }
            className={`w-9 h-9 rounded-md flex items-center justify-center border border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors focus:outline-none focus:ring-1 focus:ring-[#A30005] ${className}`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isLight ? (
                    <motion.span
                        key="moon"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.12 }}
                    >
                        <FaMoon size={14} className="text-[#A30005]" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="sun"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.12 }}
                    >
                        <FaSun size={14} className="text-neutral-400" />
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
