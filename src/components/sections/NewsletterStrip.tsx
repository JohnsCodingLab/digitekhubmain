"use client";

import React, { useState } from "react";
import { FaCheck, FaSpinner, FaEnvelope } from "react-icons/fa6";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { useLeadForm } from "@/src/lib/leads";

export default function NewsletterStrip() {
    const { state, error, submit } = useLeadForm();
    const [email, setEmail] = useState("");

    const isSubmitting = state === "submitting";
    const isSuccess = state === "success";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submit({ source: "newsletter", email });
    };

    return (
        <Section variant="dark" size="sm">
            <Container size="md">
                <ScrollReveal>
                    <div
                        className="flex flex-col md:flex-row items-center justify-between
                       gap-6 p-6 rounded-[var(--radius-xl)]
                       bg-[var(--color-bg-card)] border border-[var(--color-border)]"
                    >
                        {/* Copy */}
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <span
                                className="hidden sm:flex w-12 h-12 rounded-[var(--radius-md)]
                           bg-[var(--color-brand)]/10 text-[var(--color-brand)]
                           items-center justify-center shrink-0"
                                aria-hidden="true"
                            >
                                <FaEnvelope size={18} />
                            </span>
                            <div>
                                <h3 className="text-h4 text-white mb-1">
                                    Connectivity tips & exclusive offers
                                </h3>
                                <p className="text-body-sm text-white/50">
                                    Join our list no spam, unsubscribe anytime.
                                </p>
                            </div>
                        </div>

                        {/* Form / success */}
                        {isSuccess ? (
                            <div
                                className="flex items-center gap-3 px-5 py-3
                           rounded-[var(--radius-md)]
                           bg-emerald-400/10 border border-emerald-400/20
                           shrink-0"
                            >
                                <FaCheck
                                    className="text-emerald-400"
                                    size={14}
                                    aria-hidden="true"
                                />
                                <span className="text-body-sm text-emerald-400">
                                    You&apos;re subscribed!
                                </span>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0"
                            >
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    aria-label="Email address"
                                    className="px-4 py-3 rounded-[var(--radius-md)]
                             bg-white/5 border border-white/10 text-white
                             placeholder-white/30 text-body-sm
                             focus:outline-none focus:border-[var(--color-brand)]/50
                             disabled:opacity-50 transition-colors duration-150
                             min-w-[220px]"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-sweep bg-[var(--color-brand)] text-white
                             px-6 py-3 rounded-[var(--radius-md)]
                             text-sm font-semibold whitespace-nowrap
                             disabled:opacity-60 disabled:pointer-events-none
                             flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <FaSpinner
                                            className="animate-spin"
                                            size={14}
                                        />
                                    ) : (
                                        "Subscribe"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {state === "error" && error && (
                        <p
                            className="text-body-sm text-red-400 text-center mt-3"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </ScrollReveal>
            </Container>
        </Section>
    );
}
