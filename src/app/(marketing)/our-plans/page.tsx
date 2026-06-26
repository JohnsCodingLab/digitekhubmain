"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FAQ from "@/src/components/sections/Request";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { PlanCard } from "@/src/components/common/PlanCard";
import { useTheme } from "@/src/components/common/useTheme";
import {
    HOME_PLANS,
    BUSINESS_PLANS,
    INSTALLATION_FEE_NOTE,
} from "@/src/lib/constants";
import { staggerContainer } from "@/src/lib/animations";

// ── Plan Toggle ───────────────────────────────────────────
// Always sits on the dark photo header so text stays white
// regardless of theme — only the card grid below toggles.

function PlanToggle({
    showHome,
    onToggle,
}: {
    showHome: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1"
                role="group"
                aria-label="Plan type selection"
            >
                <motion.div
                    className="absolute top-1 bottom-1 rounded-full bg-[var(--color-brand)]"
                    style={{ width: "calc(50% - 4px)" }}
                    animate={{ left: showHome ? "calc(50% + 2px)" : "4px" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    aria-hidden="true"
                />
                <button
                    onClick={() => !showHome || onToggle()}
                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-medium
                                transition-colors duration-200 min-w-[140px]
                                ${!showHome ? "text-white" : "text-white/50"}`}
                    aria-pressed={!showHome}
                >
                    Business Plans
                </button>
                <button
                    onClick={() => showHome || onToggle()}
                    className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-medium
                                transition-colors duration-200 min-w-[140px]
                                ${showHome ? "text-white" : "text-white/50"}`}
                    aria-pressed={showHome}
                >
                    Home Plans
                </button>
            </div>
            <p className="text-caption text-white/70 text-center max-w-md">
                {INSTALLATION_FEE_NOTE}
            </p>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────

export default function OurPlans() {
    const [showHomePlans, setShowHomePlans] = useState(false);
    const plans = showHomePlans ? HOME_PLANS : BUSINESS_PLANS;
    const { isLight, className: themeClass } = useTheme();

    return (
        // themeClass is "light" or "" — scopes .light {} CSS to this page
        <div className={themeClass}>
            {/* ── Dark photo header — NEVER themes, always dark ── */}
            <div
                className="relative w-full bg-black"
                style={{ marginTop: "var(--navbar-height)" }}
            >
                <div className="absolute inset-0 -z-10">
                    <Image
                        src="/internetBackground.jpeg"
                        alt="High-speed fiber network"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div
                        className="absolute inset-0 bg-black/88"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                        aria-hidden="true"
                    />
                </div>

                <Section variant="transparent">
                    <Container size="lg">
                        <ScrollReveal>
                            <div className="text-center mb-12">
                                <span className="text-eyebrow text-white/40 mb-4 block">
                                    Pricing
                                </span>
                                <h1 className="text-h1 text-white mb-4">
                                    Choose Your Plan
                                </h1>
                                <p className="text-body-lg text-white/70 max-w-xl mx-auto mb-10">
                                    Simple, transparent pricing. No hidden fees.
                                    Upgrade or downgrade anytime.
                                </p>
                                <PlanToggle
                                    showHome={showHomePlans}
                                    onToggle={() => setShowHomePlans((p) => !p)}
                                />
                            </div>
                        </ScrollReveal>
                    </Container>
                </Section>
            </div>

            {/* ── Card grid — themes between dark and off-white ── */}
            <div
                style={{
                    background: isLight ? "#f7f7f5" : "var(--color-bg)",
                    transition: "background 0.25s ease",
                }}
            >
                <Container size="lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={showHomePlans ? "home" : "business"}
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            exit={{
                                opacity: 0,
                                y: -8,
                                transition: { duration: 0.15 },
                            }}
                            className={[
                                "grid gap-5 py-16",
                                plans.length <= 3
                                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                            ].join(" ")}
                        >
                            {plans.map((plan) => (
                                <PlanCard
                                    key={`${plan.name}-${plan.speed}`}
                                    plan={plan}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </Container>

                {/* FAQ inherits the same background via the parent div */}
                <FAQ />
            </div>
        </div>
    );
}
