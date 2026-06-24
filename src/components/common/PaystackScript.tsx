/**
 * components/common/PaystackScript.tsx
 *
 * Loads Paystack's inline checkout script once. Place this in
 * the shop page (or the marketing layout if you want it always
 * warm) — using next/script with strategy="afterInteractive"
 * so it doesn't block initial page render.
 */

"use client";

import Script from "next/script";

export function PaystackScript() {
    return (
        <Script
            src="https://js.paystack.co/v1/inline.js"
            strategy="afterInteractive"
        />
    );
}
