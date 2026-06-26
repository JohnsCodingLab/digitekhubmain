"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { SOLUTIONS } from "@/src/lib/constants";
import { staggerContainer, cardReveal } from "@/src/lib/animations";

const imageMap: Record<string, string> = {
    internetPlans: "/InternetPlans.jpeg",
    localNetwork: "/LocalNetworking.jpeg",
    maintenance: "/internet-maintenance.jpg",
    digital: "/Digital.jpeg",
};

export default function Solutions() {
    return (
        <Section variant="light-alt">
            <Container>
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                        Industry{" "}
                        <span className="text-[#A30005]">Solutions</span>
                    </h2>
                    <p className="text-sm md:text-base text-neutral-600 font-normal leading-relaxed mt-4 max-w-xl mx-auto">
                        End-to-end connectivity solutions engineered to sustain
                        core corporate and home workflows and digital data
                        scaling across Nigeria.
                    </p>
                </div>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {SOLUTIONS.map((solution) => (
                        <motion.div
                            key={solution.title}
                            variants={cardReveal}
                            className="group relative overflow-hidden rounded-[var(--radius-xl)]
                         aspect-[16/10] cursor-default"
                        >
                            {/* Background image */}
                            <Image
                                src={imageMap[solution.imageKey]}
                                alt={solution.title}
                                fill
                                className="object-cover transition-transform duration-700
                           group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 50vw"
                            />

                            {/* Base gradient overlay — always visible */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                                }}
                                aria-hidden="true"
                            />

                            {/* Hover overlay — darkens further */}
                            <div
                                className="absolute inset-0 bg-black/30 opacity-0
                           group-hover:opacity-100 transition-opacity duration-300"
                                aria-hidden="true"
                            />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                {/* Title — always visible */}
                                <h3
                                    className="text-h3 text-white font-bold mb-2
                               transition-transform duration-300
                               group-hover:-translate-y-1"
                                >
                                    {solution.title}
                                </h3>

                                {/* Description — slides up on hover */}
                                <p
                                    className="text-body-sm text-white/80 leading-relaxed
                             max-h-0 overflow-hidden opacity-0
                             group-hover:max-h-20 group-hover:opacity-100
                             transition-all duration-300"
                                >
                                    {solution.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </Section>
    );
}
