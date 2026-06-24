"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { WHY_CHOOSE_POINTS } from "@/src/lib/constants";
import { staggerContainerSlow, cardReveal } from "@/src/lib/animations";

export default function WhyChoose() {
    return (
        <Section variant="brand">
            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                    {/* Text content */}
                    <div className="flex-1 w-full">
                        <ScrollReveal direction="left">
                            <span className="text-eyebrow text-white/50 mb-3 block">
                                Why Digitek
                            </span>
                            <h2 className="text-h2 text-white mb-10">
                                Why Choose Us
                            </h2>
                        </ScrollReveal>

                        <motion.ul
                            className="flex flex-col gap-5"
                            variants={staggerContainerSlow}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            aria-label="Reasons to choose Digitek Network"
                        >
                            {WHY_CHOOSE_POINTS.map((point, index) => (
                                <motion.li
                                    key={point}
                                    variants={cardReveal}
                                    className="flex items-start gap-4"
                                >
                                    {/* Numbered badge */}
                                    <span
                                        className="flex-shrink-0 w-7 h-7 rounded-full
                               bg-[var(--color-brand)] text-white
                               text-caption font-bold
                               flex items-center justify-center mt-0.5"
                                        aria-hidden="true"
                                    >
                                        {index + 1}
                                    </span>
                                    <span className="text-body text-white/85 leading-relaxed">
                                        {point}
                                    </span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </div>

                    {/* Illustration with glow */}
                    <ScrollReveal
                        direction="right"
                        className="flex-shrink-0 w-full max-w-sm lg:max-w-md mx-auto lg:mx-0"
                    >
                        <div
                            className="relative"
                            style={{
                                filter: "drop-shadow(0 0 48px rgba(163,0,5,0.35))",
                            }}
                        >
                            <Image
                                src="/why-choose.png"
                                alt="Digitek Network connectivity illustration"
                                width={480}
                                height={480}
                                className="w-full h-auto"
                                sizes="(max-width: 1024px) 80vw, 420px"
                            />
                        </div>
                    </ScrollReveal>
                </div>
            </Container>
        </Section>
    );
}
