import React from "react";
import { cn } from "@/src/lib/utils";

type MarqueeVariant = "dark" | "light" | "brand";
type MarqueeSpeed = "slow" | "base" | "fast";

interface MarqueeStripProps {
    items?: string[];
    variant?: MarqueeVariant;
    speed?: MarqueeSpeed;
    className?: string;
}

const DEFAULT_ITEMS = [
    "Lagos",
    "Abuja",
    "Port Harcourt",
    "50,000+ Customers",
    "99.9% Uptime",
    "24/7 Support",
    "Fast Fiber",
    "Local Networking",
    "Business Internet",
    "Home Internet",
    "Enterprise Solutions",
];

const speedDuration: Record<MarqueeSpeed, string> = {
    slow: "60s",
    base: "40s",
    fast: "25s",
};

const variantClasses: Record<
    MarqueeVariant,
    {
        wrapper: string;
        border: string;
        dot: string;
        text: string;
    }
> = {
    dark: {
        wrapper: "bg-[var(--color-bg-elevated)]",
        border: "border-[var(--color-brand)]/30",
        dot: "text-[var(--color-brand)]",
        text: "text-white/60",
    },
    light: {
        wrapper: "bg-[var(--color-bg-subtle)]",
        border: "border-[var(--color-brand)]/20",
        dot: "text-[var(--color-brand)]",
        text: "text-[var(--color-text-muted)]",
    },
    brand: {
        wrapper: "bg-[var(--color-brand)]",
        border: "border-white/20",
        dot: "text-white/60",
        text: "text-white/90",
    },
};

export default function MarqueeStrip({
    items = DEFAULT_ITEMS,
    variant = "dark",
    speed = "base",
    className,
}: MarqueeStripProps) {
    const styles = variantClasses[variant];
    const duration = speedDuration[speed];

    // Duplicate items for seamless loop
    const allItems = [...items, ...items];

    return (
        <>
            {/* Inject keyframe animation via style tag */}
            <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll ${duration} linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>

            <div
                className={cn(
                    "w-full overflow-hidden border-y py-3 my-5",
                    styles.wrapper,
                    styles.border,
                    className,
                )}
                aria-hidden="true" // decorative — not meaningful content for screen readers
                role="presentation"
            >
                <div className="marquee-track flex items-center whitespace-nowrap">
                    {allItems.map((item, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-4"
                        >
                            <span
                                className={cn(
                                    "text-label tracking-widest",
                                    styles.text,
                                )}
                            >
                                {item}
                            </span>
                            <span
                                className={cn("text-xs", styles.dot)}
                                aria-hidden="true"
                            >
                                ◆
                            </span>
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
}
