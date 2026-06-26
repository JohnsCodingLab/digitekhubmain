"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/src/components/common/Modal";
import { LeadForm } from "@/src/components/common/LeadForm";

const STORAGE_KEY = "digitek_arrive_popup_shown";
const DELAY_MS = 4000;

export function OnArrivePopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem(STORAGE_KEY)) return;

        const timer = setTimeout(() => {
            setIsOpen(true);
            sessionStorage.setItem(STORAGE_KEY, "true");
        }, DELAY_MS);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => setIsOpen(false);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            labelledBy="arrive-popup-title"
        >
            <LeadForm
                source="on-arrive-popup"
                title="Register for Fast Internet in Your Area"
                description="Get connected with reliable business internet. Tell us where you're located and our team will call you within 20 minutes."
                submitLabel="Submit"
                onSuccess={() => setTimeout(handleClose, 4000)}
            />
        </Modal>
    );
}
