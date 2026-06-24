/**
 * app/(marketing)/shop/page.tsx
 *
 * Integrates hybrid context theme parsing seamlessly.
 * Standardizes shop typography tracks based on active modes.
 */

"use client";

import React from "react";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ProductPurchase } from "@/src/components/sections/ProductPurchase";
import { PaystackScript } from "@/src/components/common/PaystackScript";
import { useTheme } from "@/src/components/common/ThemeProvider";

export default function ShopPage() {
    const { pageClassName, isLight } = useTheme();

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${pageClassName}`}
        >
            <PaystackScript />
            <div style={{ marginTop: "var(--navbar-height)" }}>
                <Section
                    variant={isLight ? "light" : "dark"}
                    size="none"
                    className="pt-16 pb-24 border-b-0 bg-transparent"
                >
                    <Container size="lg">
                        <div className="text-center mb-16">
                            <span
                                className={`text-[11px] font-bold tracking-[0.15em] uppercase block mb-3 ${
                                    isLight
                                        ? "text-neutral-400"
                                        : "text-neutral-500"
                                }`}
                            >
                                Procurement Store
                            </span>
                            <h1
                                className={`text-4xl font-black tracking-tight ${
                                    isLight ? "text-neutral-900" : "text-white"
                                }`}
                            >
                                Digitek Shop
                            </h1>
                            <p
                                className={`text-sm md:text-base font-normal leading-relaxed mt-4 max-w-lg mx-auto ${
                                    isLight
                                        ? "text-neutral-600"
                                        : "text-neutral-400"
                                }`}
                            >
                                Hardware to keep your business connected, even
                                when the public power infrastructure grid
                                encounters operational exceptions.
                            </p>
                        </div>

                        <ProductPurchase />
                    </Container>
                </Section>
            </div>
        </div>
    );
}
