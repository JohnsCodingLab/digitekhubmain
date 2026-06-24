/**
 * Modal.tsx
 *
 * Shared modal primitive used by:
 *   - OnArrivePopup
 *   - ExitIntentPopup
 *   - Talk to Sales modal (PlanCard)
 *
 * Features:
 *   - Dark overlay with blur
 *   - Closes on: overlay click, Escape key, close button
 *   - Locks body scroll while open
 *   - Focus trapped within modal (basic — focuses close button on open)
 *   - Respects prefers-reduced-motion (instant show/hide instead of animation)
 *   - aria-modal, role="dialog", labelledby for accessibility
 *
 * Usage:
 *   <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} labelledBy="modal-title">
 *     <h2 id="modal-title">Title</h2>
 *     ...content...
 *   </Modal>
 */

"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IoClose } from "react-icons/io5";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    labelledBy: string;
    /** Max width of the modal panel */
    maxWidth?: string;
}

export function Modal({
    isOpen,
    onClose,
    children,
    labelledBy,
    maxWidth = "440px",
}: ModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const shouldReduceMotion = useReducedMotion();

    // Lock body scroll while open
    useEffect(() => {
        if (isOpen) {
            const original = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = original;
            };
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Focus close button when modal opens
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(
                () => closeButtonRef.current?.focus(),
                100,
            );
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const overlayTransition = shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.2 };

    const panelTransition = shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="presentation"
                >
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={overlayTransition}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={
                            shouldReduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 24, scale: 0.96 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                            shouldReduceMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 12, scale: 0.97 }
                        }
                        transition={panelTransition}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={labelledBy}
                        className="relative z-10 w-full overflow-hidden
                       rounded-[var(--radius-xl)]
                       bg-[var(--color-bg-card)]
                       border border-[var(--color-border)]
                       shadow-[var(--shadow-xl)]"
                        style={{ maxWidth }}
                    >
                        {/* Close button */}
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            aria-label="Close dialog"
                            className="absolute top-4 right-4 z-10 p-2
                         rounded-[var(--radius-sm)]
                         transition-colors duration-150
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-[var(--color-brand)]"
                            style={{ color: "var(--overlay-text-faint)" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color =
                                    "var(--color-text-primary)";
                                e.currentTarget.style.backgroundColor =
                                    "var(--overlay-soft)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color =
                                    "var(--overlay-text-faint)";
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                            }}
                        >
                            <IoClose size={20} />
                        </button>

                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
