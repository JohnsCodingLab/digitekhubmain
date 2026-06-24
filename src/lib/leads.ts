"use client";

import { useState, useCallback } from "react";
import type { LeadPayload } from "@/src/app/api/leads/route";

export type { LeadPayload };
export type { LeadSource } from "@/src/app/api/leads/route";

// ── Submit function ──────────────────────────────────────

export async function submitLead(payload: LeadPayload): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const response = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error ?? "Something went wrong. Please try again.",
            };
        }

        return { success: true };
    } catch {
        return {
            success: false,
            error: "Network error. Please check your connection and try again.",
        };
    }
}

// ── Form state ───────────────────────────────────────────

export type FormState = "idle" | "submitting" | "success" | "error";

export interface UseLeadFormReturn {
    state: FormState;
    error: string | null;
    submit: (payload: LeadPayload) => Promise<boolean>;
    reset: () => void;
}

// ── Hook ─────────────────────────────────────────────────

export function useLeadForm(): UseLeadFormReturn {
    const [state, setState] = useState<FormState>("idle");
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(
        async (payload: LeadPayload): Promise<boolean> => {
            setState("submitting");
            setError(null);

            const result = await submitLead(payload);

            if (result.success) {
                setState("success");
                return true;
            } else {
                setState("error");
                setError(result.error ?? "Something went wrong.");
                return false;
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setState("idle");
        setError(null);
    }, []);

    return { state, error, submit, reset };
}

// ── Business type options ────────────────────────────────
// Still used by Talk to Sales (companySize is separate)

export const BUSINESS_TYPES = [
    "SME / Startup",
    "Hotel / Hospitality",
    "School / University",
    "Financial Services",
    "Retail / E-commerce",
    "Corporate Office",
    "Healthcare",
    "Manufacturing",
    "Other",
] as const;

// ── Company size options ─────────────────────────────────

export const COMPANY_SIZES = [
    "1–10 employees",
    "11–50 employees",
    "51–200 employees",
    "201–500 employees",
    "500+ employees",
] as const;

// ── Area placeholder ──────────────────────────────────────
// Shared across popup forms and coverage checker for consistency

export const AREA_PLACEHOLDER = "Your area or LGA (e.g. Ikoyi, Lekki)";

// ── What to expect — success state messaging ─────────────
// Shown after successful submission. Sets clear expectations
// per source so users know exactly what happens next.

import type { LeadSource as LeadSourceType } from "@/src/app/api/leads/route";

export const WHAT_TO_EXPECT: Record<
    LeadSourceType,
    {
        heading: string;
        body: string;
        steps: string[];
    }
> = {
    "on-arrive-popup": {
        heading: "You're on the list!",
        body: "Our team will reach out within 20 minutes to confirm availability and get you connected.",
        steps: [
            "We confirm coverage in your area",
            "A connectivity expert calls you to discuss plans",
            "We schedule your installation",
        ],
    },
    "exit-intent-popup": {
        heading: "Got it — we'll be in touch!",
        body: "Our team will reach out within 20 minutes to help get your business connected.",
        steps: [
            "We confirm coverage in your area",
            "A connectivity expert calls you to discuss plans",
            "We schedule your installation",
        ],
    },
    "coverage-checker": {
        heading: "Checking your area now",
        body: "We'll confirm coverage and call you back within 20 minutes.",
        steps: [
            "We check network availability in your area",
            "A team member calls to confirm and discuss plans",
            "If covered, we schedule installation",
        ],
    },
    newsletter: {
        heading: "You're subscribed!",
        body: "Watch your inbox for connectivity tips, plan updates, and exclusive offers.",
        steps: [],
    },
    "talk-to-sales": {
        heading: "Request received!",
        body: "Our enterprise sales team will reach out within 2 business hours with a custom quote.",
        steps: [
            "Our sales team reviews your requirements",
            "We prepare a custom quote for your business",
            "A sales rep calls to walk through options",
        ],
    },
    "review-submission": {
        heading: "Thank you for sharing!",
        body: "Our team reviews every submission before it goes live. Approved stories are typically published within a few days.",
        steps: [],
    },
};
