"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { INDUSTRIES } from "@/src/lib/constants";
import { staggerContainer, cardReveal } from "@/src/lib/animations";

const imageMap: Record<string, string> = {
    startup: "/startup.jpeg",
    hotel: "/hotel.jpeg",
    education: "/education.jpeg",
    bank: "/bank.jpeg",
    mall: "/mall.jpeg",
    conference: "/conference.jpeg",
};

export default function Industries() {
    return (
        <Section variant="light" size="lg">
            <Container>
                {/* Structural Section Header */}
                <div className="text-center mb-16 md:mb-20">
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-neutral-400 block mb-3">
                        Sectors We Power
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                        Tailored Architecture For Enterprise{" "}
                        <span className="text-[#A30005]">Operations</span>
                    </h2>
                    <p className="text-sm md:text-base text-neutral-600 font-normal leading-relaxed mt-4 max-w-xl mx-auto">
                        Purpose-built structural corridors engineered to handle
                        unique throughput parameters across every operational
                        landscape.
                    </p>
                </div>

                {/* Symmetrical High-Performance Column Grid Matrix */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {INDUSTRIES.map((industry) => (
                        <motion.div
                            key={industry.title}
                            variants={cardReveal}
                            className="group relative overflow-hidden rounded-lg bg-white border border-neutral-200 aspect-[4/3] cursor-pointer shadow-sm hover:shadow-xl hover:border-neutral-300 transition-all duration-300"
                        >
                            <Image
                                src={
                                    imageMap[industry.imageKey] ||
                                    "/images/internetBackground.jpeg"
                                }
                                alt={`${industry.title} Dedicated Infrastructure Matrix`}
                                fill
                                className="object-cover transition-all duration-700 md:mix-blend-luminosity opacity-70 group-hover:scale-103 group-hover:opacity-100 group-hover:mix-blend-normal"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />

                            <div
                                className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent transition-opacity duration-300 group-hover:opacity-90"
                                aria-hidden="true"
                            />
                            <div
                                className="absolute inset-0 bg-[#A30005]/0 group-hover:bg-[#A30005]/[0.015] transition-colors duration-300"
                                aria-hidden="true"
                            />

                            {/* Bottom Content Frame */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10">
                                <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                                    {industry.ctaLabel || "View SLA Matrix"}
                                </span>

                                <h3 className="text-lg font-bold text-neutral-900 tracking-tight group-hover:text-[#A30005] transition-colors duration-200 flex items-center gap-1.5">
                                    {industry.title}
                                    <span className="inline-block text-sm transform transition-transform duration-300 group-hover:translate-x-1 text-neutral-400 group-hover:text-[#A30005]">
                                        →
                                    </span>
                                </h3>

                                <p className="text-xs md:text-sm text-neutral-600 font-normal leading-relaxed mt-2 max-w-xs transition-colors duration-300 group-hover:text-neutral-700 line-clamp-2">
                                    {industry.description}
                                </p>
                            </div>

                            <div
                                className="absolute top-0 left-0 right-0 h-[2px] bg-[#A30005] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
                                aria-hidden="true"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </Section>
    );
}
