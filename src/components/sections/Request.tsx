"use client";

import React from "react";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { Button } from "@/src/components/common/Button";
import { SITE_CONFIG } from "@/src/lib/constants";

export default function Request() {
    return (
        <Section variant="dark">
            <Container size="md">
                {/* Background glow */}
                <div className="relative">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(163,0,5,0.12) 0%, transparent 70%)",
                        }}
                        aria-hidden="true"
                    />

                    <ScrollReveal>
                        <div className="relative z-10 flex flex-col items-center text-center gap-6 py-8">
                            {/* Eyebrow */}
                            <span className="text-eyebrow">Get Started</span>

                            {/* Headline */}
                            <h2 className="text-h1 text-white max-w-2xl">
                                Ready to keep your business{" "}
                                <span className="text-gradient-brand">
                                    always connected?
                                </span>
                            </h2>

                            {/* Subtext */}
                            <p className="text-body-lg text-white/60 max-w-lg">
                                Join 500+ Nigerian businesses powered by Digitek
                                Network. Fast setup. Zero downtime commitment.
                                Dedicated support around the clock.
                            </p>

                            {/* CTA row */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                                <Button
                                    href={SITE_CONFIG.registerUrl}
                                    external
                                    variant="primary"
                                    size="lg"
                                    aria-label="Get connected with Digitek Network today"
                                >
                                    Get Connected Today
                                </Button>

                                <Button
                                    href="/our-plans"
                                    variant="ghost"
                                    size="lg"
                                    aria-label="View our internet plans and pricing"
                                >
                                    View Plans
                                </Button>
                            </div>

                            {/* Trust micro-copy */}
                            <p className="text-caption text-white/30">
                                No long-term contract required · Installation
                                within 48 hours
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </Container>
        </Section>
    );
}
