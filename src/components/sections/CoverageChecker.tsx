"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaSpinner, FaLocationDot } from "react-icons/fa6";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { useLeadForm, WHAT_TO_EXPECT } from "@/src/lib/leads";

const COVERED_AREAS = [
    "Lagos Island",
    "Lekki",
    "Victoria Island",
    "Ikoyi",
    "Surulere",
    "Ikeja",
    "Yaba",
    "Ajah",
];

export default function CoverageChecker() {
    const { state, error, submit } = useLeadForm();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [area, setArea] = useState("");
    const [email, setEmail] = useState("");

    const isSubmitting = state === "submitting";
    const isSuccess = state === "success";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submit({
            source: "coverage-checker",
            name,
            phone,
            area,
            email,
        });
    };

    const expect = WHAT_TO_EXPECT["coverage-checker"];

    return (
        <Section variant="light-alt">
            <Container size="lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left — copy + form */}
                    <ScrollReveal direction="left">
                        <span className="text-eyebrow">Coverage</span>
                        <h2 className="text-h2 text-[var(--color-text-dark)] mt-3 mb-4">
                            Check Coverage in Your Area
                        </h2>
                        <p className="text-body text-black mb-8 max-w-lg">
                            Enter your details and we&apos;ll confirm whether
                            Digitek Network is available in your area usually
                            within 20 minutes.
                        </p>

                        {isSuccess ? (
                            <div
                                className="p-6 rounded-[var(--radius-lg)]
                           bg-emerald-50 border border-emerald-200"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <span
                                        className="w-10 h-10 rounded-full bg-emerald-400/15 text-emerald-600
                               flex items-center justify-center shrink-0"
                                        aria-hidden="true"
                                    >
                                        <FaCheck size={16} />
                                    </span>
                                    <div>
                                        <p className="text-body font-semibold text-emerald-900">
                                            {expect.heading}
                                        </p>
                                        <p className="text-body-sm text-emerald-800">
                                            {expect.body}
                                        </p>
                                    </div>
                                </div>

                                {expect.steps.length > 0 && (
                                    <div className="flex flex-col gap-2 pl-1">
                                        {expect.steps.map((step, i) => (
                                            <motion.div
                                                key={step}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.15 + i * 0.08,
                                                }}
                                                className="flex items-center gap-3"
                                            >
                                                <span
                                                    className="w-5 h-5 rounded-full bg-emerald-400/15
                                     text-emerald-700 text-caption font-bold
                                     flex items-center justify-center shrink-0"
                                                    aria-hidden="true"
                                                >
                                                    {i + 1}
                                                </span>
                                                <span className="text-body-sm text-emerald-800">
                                                    {step}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-3"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        aria-label="Your name"
                                        className="w-full px-4 py-3.5 rounded-[var(--radius-md)]
                               bg-white border border-black/10
                               text-[var(--color-text-dark)]
                               placeholder-[var(--color-text-muted)]
                               text-body-sm
                               focus:outline-none focus:border-[var(--color-brand)]/50
                               disabled:opacity-50 transition-colors duration-150"
                                    />

                                    <input
                                        type="tel"
                                        required
                                        placeholder="Phone number"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        aria-label="Phone number"
                                        className="w-full px-4 py-3.5 rounded-[var(--radius-md)]
                               bg-white border border-black/10
                               text-[var(--color-text-dark)]
                               placeholder-[var(--color-text-muted)]
                               text-body-sm
                               focus:outline-none focus:border-[var(--color-brand)]/50
                               disabled:opacity-50 transition-colors duration-150"
                                    />
                                </div>

                                <div className="relative">
                                    <FaLocationDot
                                        className="absolute left-4 top-1/2 -translate-y-1/2
                               text-[var(--color-text-muted)]"
                                        size={14}
                                        aria-hidden="true"
                                    />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your area or LGA (e.g. Ikoyi, Lekki)"
                                        value={area}
                                        onChange={(e) =>
                                            setArea(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        aria-label="Your area or LGA"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-[var(--radius-md)]
                               bg-white border border-black/10
                               text-[var(--color-text-dark)]
                               placeholder-[var(--color-text-muted)]
                               text-body-sm
                               focus:outline-none focus:border-[var(--color-brand)]/50
                               disabled:opacity-50 transition-colors duration-150"
                                    />
                                </div>

                                <input
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    aria-label="Email address"
                                    className="w-full px-4 py-3.5 rounded-[var(--radius-md)]
                             bg-white border border-black/10
                             text-[var(--color-text-dark)]
                             placeholder-[var(--color-text-muted)]
                             text-body-sm
                             focus:outline-none focus:border-[var(--color-brand)]/50
                             disabled:opacity-50 transition-colors duration-150"
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-sweep bg-[var(--color-brand)] text-white
                             px-6 py-3.5 rounded-[var(--radius-md)]
                             text-sm font-semibold whitespace-nowrap
                             disabled:opacity-60 disabled:pointer-events-none
                             flex items-center justify-center gap-2 mt-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner
                                                className="animate-spin"
                                                size={14}
                                            />
                                            Checking...
                                        </>
                                    ) : (
                                        "Check Coverage"
                                    )}
                                </button>
                            </form>
                        )}

                        {state === "error" && error && (
                            <p
                                className="text-body-sm text-red-500 mt-3"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                    </ScrollReveal>

                    {/* Right — covered areas */}
                    <ScrollReveal direction="right">
                        <div
                            className="p-8 rounded-[var(--radius-xl)]
                         bg-[var(--color-bg)] border border-white/8"
                        >
                            <p className="text-label text-white/30 mb-5">
                                Currently Active In
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {COVERED_AREAS.map((area, i) => (
                                    <motion.div
                                        key={area}
                                        initial={{ opacity: 0, y: 8 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: i * 0.05,
                                            duration: 0.3,
                                        }}
                                        className="flex items-center gap-2.5 text-body-sm text-white/70"
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {area}
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-caption text-white mt-6 pt-5 border-t border-white/8">
                                Not listed? We&apos;re expanding fast submit
                                your area and we&apos;ll let you know.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </Container>
        </Section>
    );
}
