"use client";

import React from "react";
import { useTheme } from "@/src/components/common/useTheme";

export function ShopClientWrapper({ children }: { children: React.ReactNode }) {
    const { className, isLight } = useTheme();

    return (
        <div
            className={`w-full min-h-screen transition-colors duration-300 ${className}`}
            style={{
                backgroundColor: isLight ? "#f7f7f5" : "var(--color-bg)",
            }}
        >
            <div style={{ marginTop: "var(--navbar-height)" }}>
                <div className="w-full py-20 md:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header Section responding directly to isLight */}
                        <div className="text-center mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand)] bg-[var(--color-brand)]/10 px-3 py-1 rounded-full">
                                Shop
                            </span>

                            {/* Explicit isLight color overrides */}
                            <h1
                                className="text-4xl font-extrabold tracking-tight mt-4 transition-colors duration-300"
                                style={{
                                    color: isLight ? "#0f172a" : "#ffffff",
                                }}
                            >
                                Digitek Shop
                            </h1>
                            <p
                                className="text-base mt-3 max-w-lg mx-auto transition-colors duration-300"
                                style={{
                                    color: isLight ? "#475569" : "#94a3b8",
                                }}
                            >
                                Hardware to keep your business connected, even
                                when the power isn&apos;t.
                            </p>
                        </div>

                        {/* Renders <ProductPurchase /> and anything else inside */}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
