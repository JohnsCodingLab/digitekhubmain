/**
 * LeadForm.tsx
 *
 * UPDATED FOR DARK/LIGHT MODE:
 * - All 5 input/select fields now use the shared `.form-input`
 *   class (defined in globals.css) instead of repeating
 *   bg-white/5 border-white/10 text-white inline — this was
 *   genuinely repeated 5 times in the original file, so it's
 *   also a nice de-duplication, not just a theme fix.
 * - Heading/body text converted from text-white / text-white/50
 *   to token-based color (var(--color-text-primary) /
 *   var(--overlay-text-muted))
 * - Success-state step rows converted from bg-white/5
 *   border-white/8 to --overlay-soft / --overlay-border-faint
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaSpinner } from "react-icons/fa6";
import {
    useLeadForm,
    COMPANY_SIZES,
    AREA_PLACEHOLDER,
    WHAT_TO_EXPECT,
    type LeadSource,
} from "@/src/lib/leads";

interface LeadFormProps {
    source: LeadSource;
    title: string;
    description?: string;
    submitLabel: string;
    /** Pre-filled plan name for Talk to Sales */
    planInterest?: string;
    /** Called after successful submission */
    onSuccess?: () => void;
}

export function LeadForm({
    source,
    title,
    description,
    submitLabel,
    planInterest,
    onSuccess,
}: LeadFormProps) {
    const { state, error, submit } = useLeadForm();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [area, setArea] = useState("");
    const [companySize, setCompanySize] = useState("");

    const isSubmitting = state === "submitting";
    const isSuccess = state === "success";

    // ── Field visibility per source ──────────────────────────

    const showName = source !== "newsletter" && source !== "coverage-checker";
    const showEmail = true; // every form has email
    const showPhone = source !== "newsletter";
    const showArea =
        source === "on-arrive-popup" ||
        source === "exit-intent-popup" ||
        source === "coverage-checker";
    const showCompanySize = source === "talk-to-sales";

    const emailLabel =
        source === "talk-to-sales" ? "Business email" : "Email address";

    const emailPlaceholder =
        source === "talk-to-sales" ? "you@company.com" : "your@business.com";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await submit({
            source,
            ...(showName ? { name } : {}),
            ...(showEmail ? { email } : {}),
            ...(showPhone ? { phone } : {}),
            ...(showArea ? { area } : {}),
            ...(showCompanySize ? { companySize } : {}),
            ...(planInterest ? { planInterest } : {}),
        });

        if (success) {
            onSuccess?.();
        }
    };

    // ── Success state ───────────────────────────────────────

    if (isSuccess) {
        const expect = WHAT_TO_EXPECT[source];

        return (
            <div className="flex flex-col items-center text-center gap-5 px-8 py-10">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-14 h-14 rounded-full bg-emerald-400/15 text-emerald-400
                     flex items-center justify-center"
                >
                    <FaCheck size={22} />
                </motion.div>

                <div>
                    <h3
                        className="text-h4 mb-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {expect.heading}
                    </h3>
                    <p
                        className="text-body-sm max-w-xs mx-auto"
                        style={{ color: "var(--overlay-text-muted)" }}
                    >
                        {expect.body}
                    </p>
                </div>

                {/* What to expect — step list */}
                {expect.steps.length > 0 && (
                    <div className="w-full flex flex-col gap-2.5 mt-1 text-left">
                        {expect.steps.map((step, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 + i * 0.08 }}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)]"
                                style={{
                                    background: "var(--overlay-soft)",
                                    border: "1px solid var(--overlay-border-faint)",
                                }}
                            >
                                <span
                                    className="w-5 h-5 rounded-full bg-[var(--color-brand)]/15
                             text-[var(--color-brand)] text-caption font-bold
                             flex items-center justify-center shrink-0"
                                    aria-hidden="true"
                                >
                                    {i + 1}
                                </span>
                                <span
                                    className="text-body-sm"
                                    style={{
                                        color: "var(--overlay-text-strong)",
                                    }}
                                >
                                    {step}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────

    return (
        <div className="px-8 py-8">
            {/* Header */}
            <h3
                className="text-h4 mb-2"
                id="lead-form-title"
                style={{ color: "var(--color-text-primary)" }}
            >
                {title}
            </h3>
            {description && (
                <p
                    className="text-body-sm mb-6 leading-relaxed"
                    style={{ color: "var(--overlay-text-muted)" }}
                >
                    {description}
                </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {showName && (
                    <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        aria-label="Your name"
                        className="form-input w-full px-4 py-3 rounded-[var(--radius-md)]
                       text-body-sm transition-colors duration-150"
                    />
                )}

                {showEmail && (
                    <input
                        type="email"
                        required
                        placeholder={emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        aria-label={emailLabel}
                        className="form-input w-full px-4 py-3 rounded-[var(--radius-md)]
                       text-body-sm transition-colors duration-150"
                    />
                )}

                {showPhone && (
                    <input
                        type="tel"
                        required
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isSubmitting}
                        aria-label="Phone number"
                        className="form-input w-full px-4 py-3 rounded-[var(--radius-md)]
                       text-body-sm transition-colors duration-150"
                    />
                )}

                {showArea && (
                    <input
                        type="text"
                        required
                        placeholder={AREA_PLACEHOLDER}
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        disabled={isSubmitting}
                        aria-label="Your area or LGA"
                        className="form-input w-full px-4 py-3 rounded-[var(--radius-md)]
                       text-body-sm transition-colors duration-150"
                    />
                )}

                {showCompanySize && (
                    <select
                        required
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        disabled={isSubmitting}
                        aria-label="Company size"
                        className="form-input form-input-select w-full px-4 py-3 rounded-[var(--radius-md)]
                       text-body-sm transition-colors duration-150
                       appearance-none cursor-pointer"
                    >
                        <option value="">Company size</option>
                        {COMPANY_SIZES.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                )}

                {/* Error message */}
                {state === "error" && error && (
                    <p className="text-body-sm text-red-400" role="alert">
                        {error}
                    </p>
                )}

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-sweep bg-[var(--color-brand)] text-white
                     px-5 py-3 rounded-[var(--radius-md)]
                     text-sm font-semibold mt-1
                     disabled:opacity-60 disabled:pointer-events-none
                     flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <FaSpinner className="animate-spin" size={14} />
                            Sending...
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>

                {/* Privacy note */}
                <p
                    className="text-caption text-center mt-1"
                    style={{ color: "var(--overlay-text-faint)" }}
                >
                    🔒 We never share your details with third parties.
                </p>
            </form>
        </div>
    );
}
