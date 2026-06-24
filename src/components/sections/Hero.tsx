"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/src/lib/constants";
import { Button } from "@/src/components/common/Button";
import { heroContainer, heroItem } from "@/src/lib/animations";

// ── Slideshow config ────────────────────────────────────
// Each slide gets its own Ken Burns animation (different zoom
// target + duration) so the cycle doesn't feel mechanical.
// Add hero-2.jpeg and hero-3.jpeg to /public to complete the set.

const SLIDES = [
    {
        src: "/heroImg.jpeg",
        alt: "Business professionals in a modern connected office",
        anim: "kbZoomA",
    },
    {
        src: "/InternetPlans.jpeg",
        alt: "Network operations and connectivity infrastructure",
        anim: "kbZoomB",
    },
    {
        src: "/startup.jpeg",
        alt: "Team collaborating in a connected workspace",
        anim: "kbZoomC",
    },
];

const SLIDE_DURATION_MS = 8000;
const CROSSFADE_MS = 1500;

function HeroSlideshow() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);

        if (mq.matches) return; // static — no cycling

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % SLIDES.length);
        }, SLIDE_DURATION_MS);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <style>{`
                @keyframes kbZoomA {
                    0%   { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.12) translate(-1.5%, -1.5%); }
                }
                @keyframes kbZoomB {
                    0%   { transform: scale(1.06) translate(1%, 0); }
                    100% { transform: scale(1.16) translate(-1%, 1.5%); }
                }
                @keyframes kbZoomC {
                    0%   { transform: scale(1) translate(0, 1%); }
                    100% { transform: scale(1.14) translate(1.5%, -1%); }
                }
                .hero-slide {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    transition: opacity ${CROSSFADE_MS}ms ease-in-out;
                }
                .hero-slide.active {
                    opacity: 1;
                }
                .hero-slide-inner {
                    position: absolute;
                    inset: 0;
                    animation-duration: ${SLIDE_DURATION_MS + CROSSFADE_MS}ms;
                    animation-timing-function: ease-in-out;
                    animation-fill-mode: forwards;
                    transform-origin: center center;
                }
                .hero-slide.active .hero-slide-inner {
                    animation-name: var(--kb-anim);
                }
                @media (prefers-reduced-motion: reduce) {
                    .hero-slide-inner { animation: none !important; }
                    .hero-slide { transition: none !important; }
                }
            `}</style>

            {SLIDES.map((slide, i) => (
                <div
                    key={slide.src}
                    className={`hero-slide ${i === activeIndex || (reducedMotion && i === 0) ? "active" : ""}`}
                    aria-hidden={i !== activeIndex}
                >
                    <div
                        className="hero-slide-inner"
                        style={
                            { "--kb-anim": slide.anim } as React.CSSProperties
                        }
                    >
                        <Image
                            src={slide.src}
                            alt={slide.alt}
                            fill
                            className="object-cover object-center pointer-events-none mix-blend-luminosity opacity-30"
                            priority={i === 0}
                            sizes="100vw"
                        />
                    </div>
                </div>
            ))}
        </>
    );
}

export default function Hero() {
    return (
        <div
            className="relative w-full min-h-[740px] md:min-h-[820px] flex items-center bg-[#0a0a0a] overflow-hidden"
            style={{
                marginTop: "var(--navbar-height)",
                fontFamily: "'Rubik', sans-serif",
            }}
        >
            {/* 1. Ken Burns slideshow background — 3 images crossfading */}
            <HeroSlideshow />

            {/* 2. Pure Technical Lighting Gradients Layer */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse 70% 60% at 80% 50%, rgba(163,0,5,0.08) 0%, transparent 75%),
                        radial-gradient(ellipse 40% 80% at 85% 20%, rgba(255,255,255,0.01) 0%, transparent 60%)
                    `,
                }}
                aria-hidden="true"
            />

            {/* 3. Deep Left Vignette — Guarantees perfect high-contrast typography reading */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent opacity-95 md:opacity-90"
                aria-hidden="true"
            />

            {/* 4. Bottom Fade — Seamlessly blends the hero into lower page sections */}
            <div
                className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent pointer-events-none"
                aria-hidden="true"
            />

            {/* 5. Top Brand Accent Line */}
            <div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#A30005] via-transparent to-transparent"
                aria-hidden="true"
            />

            {/* Balanced Two-Column Main Grid */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Side Column: Core Brand Messaging Frame */}
                <motion.div
                    className="lg:col-span-7 flex flex-col items-center md:items-start text-center md:text-left"
                    variants={heroContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Eyebrow Pill */}
                    <motion.div
                        variants={heroItem}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-white/12 rounded-full bg-white/5 backdrop-blur-md"
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-[#A30005] shadow-[0_0_6px_#A30005] flex-shrink-0"
                            aria-hidden="true"
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">
                            Nigeria&apos;s Leading Internet Provider
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={heroItem}
                        className="text-white font-extrabold text-3xl sm:text-4xl md:text-[3.75rem] leading-[1.08] tracking-tight mb-5"
                    >
                        Powering Businesses
                        <br />
                        with Fast, Reliable &amp;
                        <br />
                        Affordable Internet{" "}
                        <span className="bg-gradient-to-r from-[#A30005] to-[#cc0006] bg-clip-text text-transparent">
                            Solutions
                        </span>
                    </motion.h1>

                    {/* Body Copy */}
                    <motion.p
                        variants={heroItem}
                        className="text-neutral-400 text-base sm:text-[1.0625rem] leading-[1.7] max-w-[520px] mb-9 font-normal"
                    >
                        High-speed, enterprise-grade connectivity built for
                        Nigerian businesses — with 99.9% uptime and 24/7 local
                        support.
                    </motion.p>

                    {/* Actions and Targets Row */}
                    <motion.div
                        variants={heroItem}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10 flex-wrap"
                    >
                        <Button
                            href={SITE_CONFIG.registerUrl}
                            external
                            variant="primary"
                            size="lg"
                            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#A30005] text-white font-semibold text-sm rounded transition-all hover:bg-[#7a0004] hover:shadow-[0_6px_24px_rgba(163,0,5,0.28)] hover:-translate-y-0.5 text-center w-full sm:w-auto"
                            aria-label="Get connected with Digitek Network today"
                        >
                            Get Connected Today
                            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 text-base">
                                →
                            </span>
                        </Button>

                        <Link
                            href="/our-plans"
                            className="group inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-transparent border border-white/15 text-white/75 hover:text-white hover:border-white/30 hover:bg-white/5 font-medium text-sm rounded transition-all text-center w-full sm:w-auto"
                            aria-label="View our internet plans and pricing"
                        >
                            See Our Plans
                            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 text-base">
                                →
                            </span>
                        </Link>
                    </motion.div>

                    {/* Linear Separation Divider */}
                    <motion.div
                        variants={heroItem}
                        className="w-full max-w-[480px] h-px bg-gradient-to-r from-white/12 to-transparent mb-8"
                        aria-hidden="true"
                    />

                    {/* Integrated Key Statistics Track */}
                    <motion.div
                        variants={heroItem}
                        className="flex items-center justify-center md:justify-start gap-10 flex-wrap"
                        aria-label="Key statistics"
                    >
                        <div className="flex flex-col gap-1 text-left">
                            <span className="text-3xl font-extrabold text-white leading-none tracking-tight">
                                500+
                            </span>
                            <span className="text-[10.5px] font-semibold text-neutral-500 uppercase tracking-widest mt-1">
                                Customers
                            </span>
                        </div>
                        <div
                            className="w-px h-10 bg-white/10 self-center hidden sm:block"
                            aria-hidden="true"
                        />
                        <div className="flex flex-col gap-1 text-left">
                            <span className="text-3xl font-extrabold text-white leading-none tracking-tight">
                                99.9%
                            </span>
                            <span className="text-[10.5px] font-semibold text-neutral-500 uppercase tracking-widest mt-1">
                                Uptime
                            </span>
                        </div>
                        <div
                            className="w-px h-10 bg-white/10 self-center hidden sm:block"
                            aria-hidden="true"
                        />
                        <div className="flex flex-col gap-1 text-left">
                            <span className="text-3xl font-extrabold text-white leading-none tracking-tight">
                                24/7
                            </span>
                            <span className="text-[10.5px] font-semibold text-neutral-500 uppercase tracking-widest mt-1">
                                Support
                            </span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Side Column: Minimalist Tech Filler Layout (NGCOM Style Balance) */}
                <div
                    className="hidden lg:relative lg:col-span-5 h-[400px] w-full items-center justify-center pointer-events-none"
                    aria-hidden="true"
                >
                    {/* Ultra-fine horizontal/vertical background grid intersecting rays */}
                    <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
                    <div className="absolute top-0 bottom-0 left-3/4 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
                    <div className="absolute left-0 right-0 top-1/4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="absolute left-0 right-0 top-3/4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                    {/* Concentric clean vector fiber paths mapping infrastructure loops */}
                    <div className="absolute w-72 h-72 rounded-full border border-dashed border-white/5 animate-[spin_160s_linear_infinite]" />
                    <div className="absolute w-52 h-52 rounded-full border border-white/5 opacity-60" />
                    <div className="absolute w-32 h-32 rounded-full border border-dashed border-white/5 animate-[spin_90s_linear_infinite]" />

                    {/* High-contrast core brand identity network node point */}
                    <div className="relative w-2,5 h-2.5 rounded-full bg-[#A30005] shadow-[0_0_16px_6px_rgba(163,0,5,0.35)]">
                        <div className="absolute inset-0 rounded-full bg-[#A30005] animate-ping opacity-30" />
                    </div>
                </div>
            </div>

            {/* Bottom Left Scroll Indicator Cue */}
            <div className="absolute bottom-8 left-12 z-10 hidden lg:flex items-center gap-2 text-white/30 text-[11px] font-medium uppercase tracking-[0.08em] pointer-events-none">
                <span className="w-6 h-px bg-white/20" aria-hidden="true" />
                Scroll to explore
            </div>
        </div>
    );
}
