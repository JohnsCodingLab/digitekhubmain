"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal } from "@/src/components/common/Modal";
import { LeadForm } from "@/src/components/common/LeadForm";

const STORAGE_KEY = "digitek_exit_popup_shown";
const MIN_TIME_ON_PAGE = 8000;

export function ExitIntentPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const pageLoadTime = useRef(Date.now());
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (sessionStorage.getItem(STORAGE_KEY)) return;

        const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
        if (isTouchDevice) return;

        const handleMouseLeave = (e: MouseEvent) => {
            if (hasTriggered.current) return;
            if (Date.now() - pageLoadTime.current < MIN_TIME_ON_PAGE) return;

            if (e.clientY <= 10 && e.relatedTarget === null) {
                hasTriggered.current = true;
                setIsOpen(true);
                sessionStorage.setItem(STORAGE_KEY, "true");
            }
        };

        document.addEventListener("mouseleave", handleMouseLeave);
        return () =>
            document.removeEventListener("mouseleave", handleMouseLeave);
    }, []);

    const handleClose = () => setIsOpen(false);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            labelledBy="exit-popup-title"
        >
            <LeadForm
                source="exit-intent-popup"
                title="Don't Miss Out — Get Connected"
                description="Fast, reliable business internet is closer than you think. Register now and we'll call you within 20 minutes."
                submitLabel="Register My Business"
                onSuccess={() => setTimeout(handleClose, 4000)}
            />
        </Modal>
    );
}
