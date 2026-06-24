"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineDevices, MdSupportAgent } from "react-icons/md";
import {
    FaDownload,
    FaTv,
    FaWifi,
    FaInfinity,
    FaCalendar,
    FaChevronDown,
    FaPhone,
} from "react-icons/fa6";
import { BiCircle } from "react-icons/bi";
import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
import { LeadForm } from "@/src/components/common/LeadForm";
import { useTheme } from "@/src/lib/useTheme";
import { cardReveal } from "@/src/lib/animations";
import { SITE_CONFIG, type Plan } from "@/src/lib/constants";

// ── Feature icon ──────────────────────────────────────────

export function FeatureIcon({ feature }: { feature: string }) {
    const f = feature.toLowerCase();
    if (f.includes("device"))
        return (
            <MdOutlineDevices className="text-blue-400 shrink-0" size={15} />
        );
    if (f.includes("download"))
        return <FaDownload className="text-emerald-400 shrink-0" size={13} />;
    if (f.includes("stream"))
        return <FaTv className="text-yellow-400 shrink-0" size={13} />;
    if (f.includes("wifi") || f.includes("5g"))
        return <FaWifi className="text-violet-400 shrink-0" size={13} />;
    if (f.includes("caps") || f.includes("unlimited"))
        return <FaInfinity className="text-pink-400 shrink-0" size={13} />;
    if (f.includes("validity") || f.includes("days"))
        return <FaCalendar className="text-orange-400 shrink-0" size={13} />;
    if (f.includes("support") || f.includes("premium"))
        return <MdSupportAgent className="text-cyan-400 shrink-0" size={15} />;
    return (
        <BiCircle
            className="shrink-0"
            style={{ color: "var(--overlay-text-faint)" }}
            size={13}
        />
    );
}

// ── Cost breakdown ────────────────────────────────────────

function CostBreakdown({ plan, isLight }: { plan: Plan; isLight: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="rounded-[var(--radius-md)] overflow-hidden"
            style={{
                border: isLight
                    ? "1px solid #e0e0e0"
                    : "1px solid var(--overlay-border-faint)",
            }}
        >
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-3
                           text-left transition-colors duration-150 border-none outline-none cursor-pointer"
                style={{
                    background: isLight ? "#f5f5f5" : "var(--overlay-soft)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background = isLight
                        ? "#eeeeee"
                        : "var(--overlay-medium)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isLight
                        ? "#f5f5f5"
                        : "var(--overlay-soft)")
                }
                aria-expanded={open}
                aria-label="View first-time cost breakdown"
            >
                <span
                    className="text-body-sm"
                    style={{
                        color: isLight
                            ? "#555555"
                            : "var(--overlay-text-muted)",
                    }}
                >
                    First-time total
                </span>
                <div className="flex items-center gap-2">
                    <span
                        className="text-body-sm font-semibold"
                        style={{
                            color: isLight
                                ? "#111111"
                                : "var(--overlay-text-strong)",
                        }}
                    >
                        {plan.totalFirstCost}
                    </span>
                    <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            color: isLight
                                ? "#888888"
                                : "var(--overlay-text-faint)",
                        }}
                        aria-hidden="true"
                    >
                        <FaChevronDown size={11} />
                    </motion.span>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="px-4 py-3 flex flex-col gap-2"
                            style={{
                                background: isLight
                                    ? "#fafafa"
                                    : "var(--overlay-faint)",
                            }}
                        >
                            {/* Fixed implicit any assignment typing map wrapper */}
                            {[
                                {
                                    label: "Monthly plan",
                                    value: plan.monthlyPrice,
                                },
                                {
                                    label: "Installation",
                                    value: plan.installationFee,
                                },
                                { label: "VAT (7.5%)", value: plan.vat },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="flex justify-between text-caption"
                                    style={{
                                        color: isLight
                                            ? "#666666"
                                            : "var(--overlay-text-muted)",
                                    }}
                                >
                                    <span>{label}</span>
                                    <span
                                        style={{
                                            color: isLight
                                                ? "#111111"
                                                : "var(--overlay-text-strong)",
                                        }}
                                    >
                                        {value}
                                    </span>
                                </div>
                            ))}
                            <div
                                className="flex justify-between pt-2 mt-1 text-body-sm font-semibold"
                                style={{
                                    borderTop: isLight
                                        ? "1px solid #e0e0e0"
                                        : "1px solid var(--overlay-border-soft)",
                                    color: isLight
                                        ? "#000000"
                                        : "var(--color-text-primary)",
                                }}
                            >
                                <span>Total</span>
                                <span>{plan.totalFirstCost}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Plan Card ─────────────────────────────────────────────

interface PlanCardProps {
    plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
    const isHighlighted = plan.highlighted ?? false;
    const isEnterprise = plan.name.toLowerCase().includes("enterprise");
    const { isLight } = useTheme();

    const [salesModalOpen, setSalesModalOpen] = useState(false);

    // ── Non-highlighted card styles ───────────────────────
    // Dark mode: original dark card (unchanged)
    // Light mode: white bg, black text, subtle shadow for depth
    // Highlighted card: NEVER changes — same in both modes

    const cardStyle = !isHighlighted
        ? isLight
            ? {
                  background: "#ffffff",
                  border: "1px solid #e0e0e0",
                  boxShadow:
                      "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
              }
            : undefined // dark mode uses Tailwind classes (unchanged)
        : undefined; // highlighted card ignores both

    const cardHoverStyle =
        !isHighlighted && isLight
            ? "hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)] hover:border-[#A30005]/30 hover:-translate-y-1"
            : !isHighlighted
              ? "hover:border-[var(--color-brand)]/30 hover:shadow-[var(--shadow-brand)] hover:-translate-y-1"
              : "";

    return (
        <>
            <motion.div
                variants={cardReveal}
                style={cardStyle}
                className={[
                    "relative flex flex-col rounded-[var(--radius-xl)] overflow-hidden",
                    "transition-all duration-300",
                    isHighlighted
                        ? // ── Most Popular — UNCHANGED in both modes ──────
                          "bg-white text-[var(--color-text-dark)] shadow-[var(--shadow-brand-lg)] scale-[1.02] z-10"
                        : // ── Regular card — dark mode base classes ───────
                          // (light mode overrides via inline style above)
                          `${isLight ? "" : "bg-[var(--color-bg-card)] border border-[var(--color-border)]"} ${cardHoverStyle}`,
                ].join(" ")}
            >
                {/* Most Popular badge — unchanged */}
                {isHighlighted && (
                    <div
                        className="bg-[var(--color-brand)] text-white text-label
                                    text-center py-2 px-4 tracking-widest"
                    >
                        ★ MOST POPULAR
                    </div>
                )}

                <div className="flex flex-col flex-1 p-6 gap-5">
                    {/* Plan name */}
                    <div>
                        <p
                            className="text-label mb-1"
                            style={{
                                color: isHighlighted
                                    ? "var(--color-brand)"
                                    : isLight
                                      ? "var(--color-brand)"
                                      : "var(--overlay-text-subtle)",
                            }}
                        >
                            {plan.name}
                        </p>

                        <div className="flex items-baseline gap-1">
                            <span
                                className="font-black leading-none"
                                style={{
                                    fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                                    color: isHighlighted
                                        ? "var(--color-text-dark)"
                                        : isLight
                                          ? "#000000"
                                          : "var(--color-text-primary)",
                                }}
                            >
                                {plan.speed.replace(" Mbps", "")}
                            </span>
                            <span
                                className="text-body font-medium"
                                style={{
                                    color: isHighlighted
                                        ? "var(--color-text-muted)"
                                        : isLight
                                          ? "#555555"
                                          : "var(--overlay-text-subtle)",
                                }}
                            >
                                Mbps
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div
                        className="h-px w-full"
                        style={{
                            background: isHighlighted
                                ? "rgba(0,0,0,0.1)"
                                : isLight
                                  ? "#e0e0e0"
                                  : "var(--overlay-border-faint)",
                        }}
                        aria-hidden="true"
                    />

                    {/* Monthly price */}
                    <div className="flex items-baseline gap-1">
                        <span
                            className="text-h2 font-bold"
                            style={{
                                color: isHighlighted
                                    ? "var(--color-text-dark)"
                                    : isLight
                                      ? "#000000"
                                      : "var(--color-text-primary)",
                            }}
                        >
                            {plan.monthlyPrice}
                        </span>
                        <span
                            className="text-body-sm"
                            style={{
                                color: isHighlighted
                                    ? "var(--color-text-muted)"
                                    : isLight
                                      ? "#555555"
                                      : "var(--overlay-text-subtle)",
                            }}
                        >
                            / month
                        </span>
                    </div>

                    {/* Features */}
                    <ul
                        className="flex flex-col gap-2.5 flex-1 text-left"
                        aria-label="Plan features"
                    >
                        {/* Fix: Explicit string typing on iterator variable parameter map loop */}
                        {plan.features.map((feature: string) => (
                            <li
                                key={feature}
                                className="flex items-center gap-2.5 text-body-sm"
                                style={{
                                    color: isHighlighted
                                        ? "var(--color-text-dark-muted)"
                                        : isLight
                                          ? "#333333"
                                          : "var(--overlay-text-strong)",
                                }}
                            >
                                <FeatureIcon feature={feature} />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {/* Cost breakdown */}
                    {isHighlighted ? (
                        <div className="rounded-[var(--radius-md)] border border-black/10 overflow-hidden">
                            <div className="px-4 py-3 bg-black/5 flex items-center justify-between">
                                <span className="text-body-sm text-[var(--color-text-muted)]">
                                    First-time total
                                </span>
                                <span className="text-body-sm font-semibold text-[var(--color-text-dark)]">
                                    {plan.totalFirstCost}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <CostBreakdown plan={plan} isLight={isLight} />
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col gap-2">
                        <Button
                            href={SITE_CONFIG.registerUrl}
                            external
                            variant={
                                isHighlighted
                                    ? "primary"
                                    : isLight
                                      ? "outline"
                                      : "ghost"
                            }
                            size="md"
                            className="w-full justify-center text-xs font-bold uppercase tracking-widest py-3"
                            aria-label={`Get the ${plan.name} plan — ${plan.monthlyPrice} per month`}
                        >
                            {isHighlighted
                                ? "Get This Plan →"
                                : "Get This Plan"}
                        </Button>

                        {isEnterprise && (
                            <button
                                onClick={() => setSalesModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2
                                           px-5 py-2.5 rounded-[var(--radius-sm)]
                                           text-sm font-medium transition-colors duration-150 border-none cursor-pointer focus:outline-none"
                                style={{
                                    color: isHighlighted
                                        ? "var(--color-brand)"
                                        : isLight
                                          ? "#A30005"
                                          : "var(--overlay-text-muted)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = isLight
                                        ? "rgba(163,0,5,0.06)"
                                        : isHighlighted
                                          ? "rgba(0,0,0,0.05)"
                                          : "var(--overlay-soft)";
                                    if (!isHighlighted && !isLight) {
                                        e.currentTarget.style.color =
                                            "var(--color-text-primary)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "transparent";
                                    e.currentTarget.style.color = isHighlighted
                                        ? "var(--color-brand)"
                                        : isLight
                                          ? "#A30005"
                                          : "var(--overlay-text-muted)";
                                }}
                            >
                                <FaPhone size={12} aria-hidden="true" />
                                Talk to Sales
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {isEnterprise && (
                <Modal
                    isOpen={salesModalOpen}
                    onClose={() => setSalesModalOpen(false)}
                    labelledBy="sales-modal-title"
                >
                    <LeadForm
                        source="talk-to-sales"
                        title="Talk to Our Sales Team"
                        description={`Tell us about your business and we'll put together a custom quote for the ${plan.name} plan.`}
                        submitLabel="Request a Call"
                        planInterest={plan.name}
                        onSuccess={() =>
                            setTimeout(() => setSalesModalOpen(false), 2500)
                        }
                    />
                </Modal>
            )}
        </>
    );
}
