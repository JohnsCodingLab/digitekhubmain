"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    fadeIn,
    scaleIn,
} from "@/src/lib/animations";

type RevealDirection = "up" | "left" | "right" | "none" | "scale";

interface ScrollRevealProps {
    children: React.ReactNode;
    direction?: RevealDirection;
    delay?: number;
    duration?: number;
    variant?: Variants;
    className?: string;
    once?: boolean; // animate once (default) or every time element enters view
    threshold?: number; // 0–1, how much of the element must be visible
}

const directionVariants: Record<RevealDirection, Variants> = {
    up: fadeInUp,
    left: fadeInLeft,
    right: fadeInRight,
    none: fadeIn,
    scale: scaleIn,
};

export function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    duration,
    variant,
    className,
    once = true,
    threshold = 0.15,
}: ScrollRevealProps) {
    const shouldReduceMotion = useReducedMotion();

    // When reduced motion is preferred, skip animation entirely
    // by rendering children without any motion wrapper
    if (shouldReduceMotion) {
        return <div className={className}>{children}</div>;
    }

    const selectedVariant = variant ?? directionVariants[direction];

    // Apply custom delay and duration to the variant's visible state
    const finalVariant: Variants =
        delay > 0 || duration !== undefined
            ? {
                  ...selectedVariant,
                  visible: {
                      ...(selectedVariant.visible as object),
                      transition: {
                          ...((
                              selectedVariant.visible as { transition?: object }
                          )?.transition ?? {}),
                          ...(delay > 0 && { delay }),
                          ...(duration !== undefined && { duration }),
                      },
                  },
              }
            : selectedVariant;

    return (
        <motion.div
            className={className}
            variants={finalVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{
                once,
                amount: threshold,
            }}
        >
            {children}
        </motion.div>
    );
}
