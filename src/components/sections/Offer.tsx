"use client";

import React from "react";
import { motion } from "framer-motion";
import { Network, ShieldCheck, Activity } from "lucide-react";
import { Container } from "@/src/components/layout/Container";
import { staggerContainer, cardReveal } from "@/src/lib/animations";
import { Section } from "../layout/Section";

const PROMISES = [
    {
        icon: <Network className="w-5 h-5" />,
        metric: "1:1 Ratio",
        title: "Dedicated Fiber Infrastructure",
        description:
            "Pure synchronous enterprise-grade lines with symmetric download and upload limits, avoiding local neighborhood congestion.",
    },
    {
        icon: <ShieldCheck className="w-5 h-5" />,
        metric: "Urgent SLA",
        title: "Guaranteed Response Matrix",
        description:
            "Backed by formal Service Level Agreements ensuring automated failovers and real-time local on-site field support across Nigeria.",
    },
    {
        icon: <Activity className="w-5 h-5" />,
        metric: "10 Gbps+",
        title: "Scalable Elastic Throughput",
        description:
            "Seamlessly expand your institutional bandwidth caps instantly to handle major video conferences, events, or cloud sync pipelines.",
    },
];

export default function Offer() {
    return (
        <Section variant="dark" className="w-full py-16 md:py-24">
            <Container>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
                    {PROMISES.map((promise) => (
                        <motion.div
                            key={promise.title}
                            variants={cardReveal}
                            className="group relative flex flex-col items-start text-left p-8 rounded-lg bg-neutral-950 border border-neutral-900 transition-all duration-300 hover:border-neutral-800 hover:shadow-lg hover:shadow-black"
                        >
                            {/* Structural Accent Line Interceptor — Invisible by default, illuminates perfectly on hover */}
                            <div
                                className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#A30005] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-lg"
                                aria-hidden="true"
                            />

                            {/* Solid Header Identity Strip */}
                            <div className="w-full flex items-center justify-between mb-6">
                                <div
                                    className="w-10 h-10 rounded border border-neutral-800 flex items-center justify-center bg-neutral-900/50 text-neutral-400 group-hover:text-white group-hover:border-neutral-700 transition-all duration-300"
                                    aria-hidden="true"
                                >
                                    {promise.icon}
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 bg-neutral-900/30 px-2.5 py-1 rounded border border-neutral-900">
                                    {promise.metric}
                                </span>
                            </div>

                            {/* Main Structural Content Stack */}
                            <div className="flex flex-col gap-2 mt-2">
                                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[#A30005] transition-colors duration-200">
                                    {promise.title}
                                </h3>
                                <p className="text-sm text-neutral-400 font-normal leading-relaxed mt-1">
                                    {promise.description}
                                </p>
                            </div>

                            {/* Crisp Monochromatic Corner Ambient Indicator */}
                            <div
                                className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{
                                    background:
                                        "radial-gradient(circle at top right, rgba(163,0,5,0.06), transparent 70%)",
                                }}
                                aria-hidden="true"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </Section>
    );
}
