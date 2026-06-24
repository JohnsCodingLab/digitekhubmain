import type { Variants } from "framer-motion";

// ─────────────────────────────────────────────
// TIMING CONSTANTS
// Single place to tune the feel of the entire site
// ─────────────────────────────────────────────

export const DURATION = {
    fast: 0.2,
    base: 0.35,
    slow: 0.5,
    slower: 0.7,
} as const;

export const EASE = {
    // Standard easing for most UI transitions
    base: [0.25, 0.1, 0.25, 1] as const,
    // Overshoot slightly for entrances — feels alive
    enter: [0.22, 1, 0.36, 1] as const,
    // Clean deceleration for exits
    exit: [0.4, 0, 1, 1] as const,
} as const;

export const STAGGER = {
    fast: 0.05,
    base: 0.08,
    slow: 0.12,
    slower: 0.18,
} as const;

// ─────────────────────────────────────────────
// CORE REVEAL VARIANTS
// Used by ScrollReveal component
// ─────────────────────────────────────────────

export const fadeInUp: Variants = {
    hidden: {
        opacity: 0,
        y: 28,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.slow,
            ease: EASE.enter,
        },
    },
};

export const fadeInDown: Variants = {
    hidden: {
        opacity: 0,
        y: -24,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.slow,
            ease: EASE.enter,
        },
    },
};

export const fadeInLeft: Variants = {
    hidden: {
        opacity: 0,
        x: -32,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: DURATION.slow,
            ease: EASE.enter,
        },
    },
};

export const fadeInRight: Variants = {
    hidden: {
        opacity: 0,
        x: 32,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: DURATION.slow,
            ease: EASE.enter,
        },
    },
};

export const fadeIn: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: DURATION.base,
            ease: EASE.base,
        },
    },
};

export const scaleIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.94,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: DURATION.slow,
            ease: EASE.enter,
        },
    },
};

// ─────────────────────────────────────────────
// STAGGER CONTAINERS
// Wrap lists of items — children animate in sequence
// ─────────────────────────────────────────────

export const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: STAGGER.base,
            delayChildren: 0.1,
        },
    },
};

export const staggerContainerFast: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: STAGGER.fast,
            delayChildren: 0.05,
        },
    },
};

export const staggerContainerSlow: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: STAGGER.slow,
            delayChildren: 0.15,
        },
    },
};

// ─────────────────────────────────────────────
// HERO SECTION VARIANTS
// Orchestrated sequence: eyebrow → headline → sub → CTA
// ─────────────────────────────────────────────

export const heroContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.2,
        },
    },
};

export const heroItem: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.slower,
            ease: EASE.enter,
        },
    },
};

// ─────────────────────────────────────────────
// CARD VARIANTS
// For plan cards, industry cards, solution cards
// ─────────────────────────────────────────────

export const cardReveal: Variants = {
    hidden: {
        opacity: 0,
        y: 24,
        scale: 0.97,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: DURATION.slow,
            ease: EASE.enter,
        },
    },
};

// Hover state — used with whileHover prop directly (not a variant)
export const cardHoverStyles = {
    y: -6,
    scale: 1.01,
    transition: {
        duration: DURATION.fast,
        ease: EASE.base,
    },
};

export const cardTapStyles = {
    scale: 0.98,
    transition: {
        duration: 0.1,
    },
};

// ─────────────────────────────────────────────
// NAVBAR VARIANTS
// Slide down from top on mount
// ─────────────────────────────────────────────

export const navbarReveal: Variants = {
    hidden: {
        opacity: 0,
        y: -16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: DURATION.base,
            ease: EASE.enter,
        },
    },
};

// Mobile menu open/close
export const mobileMenuVariants: Variants = {
    closed: {
        opacity: 0,
        height: 0,
        transition: {
            duration: DURATION.base,
            ease: EASE.exit,
        },
    },
    open: {
        opacity: 1,
        height: "auto",
        transition: {
            duration: DURATION.base,
            ease: EASE.enter,
        },
    },
};

// ─────────────────────────────────────────────
// STAT / COUNTER VARIANTS
// For animated number reveals in the stats section
// ─────────────────────────────────────────────

export const statReveal: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 16,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: DURATION.slow,
            ease: EASE.enter,
        },
    },
};

// ─────────────────────────────────────────────
// PLAN TOGGLE VARIANTS
// For the business/home plan switch animation
// Replaces the current mode="sync" which causes layout jumps
// ─────────────────────────────────────────────

export const planGridVariants: Variants = {
    enter: (direction: number) => ({
        opacity: 0,
        x: direction > 0 ? 40 : -40,
    }),
    center: {
        opacity: 1,
        x: 0,
        transition: {
            duration: DURATION.base,
            ease: EASE.enter,
        },
    },
    exit: (direction: number) => ({
        opacity: 0,
        x: direction > 0 ? -40 : 40,
        transition: {
            duration: DURATION.fast,
            ease: EASE.exit,
        },
    }),
};

// ─────────────────────────────────────────────
// FAQ ACCORDION VARIANTS
// ─────────────────────────────────────────────

export const faqAnswerVariants: Variants = {
    hidden: {
        opacity: 0,
        height: 0,
        marginTop: 0,
    },
    visible: {
        opacity: 1,
        height: "auto",
        marginTop: 16,
        transition: {
            height: {
                duration: DURATION.base,
                ease: EASE.enter,
            },
            opacity: {
                duration: DURATION.base,
                delay: 0.05,
            },
        },
    },
};

// ─────────────────────────────────────────────
// UTILITY: Build a delayed variant
// For when you need a one-off delay on a specific element
// Usage: withDelay(fadeInUp, 0.3)
// ─────────────────────────────────────────────

export function withDelay(variant: Variants, delay: number): Variants {
    return {
        ...variant,
        visible: {
            ...(variant.visible as object),
            transition: {
                ...((variant.visible as { transition?: object })?.transition ??
                    {}),
                delay,
            },
        },
    };
}
