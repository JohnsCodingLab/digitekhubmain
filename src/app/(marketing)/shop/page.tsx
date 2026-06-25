/**
 * app/(marketing)/shop/page.tsx
 *
 * Keeps SEO metadata server-side while passing the content
 * into our reactive, theme-aware wrapper.
 */

import React from "react";
import type { Metadata } from "next";
import { ProductPurchase } from "@/src/components/sections/ProductPurchase";
import { ShopClientWrapper } from "./ShopClientWrapper";

export const metadata: Metadata = {
    title: "Shop | Digitek Network",
    description:
        "Shop the Digitek PowerBank — reliable backup power for your router and devices, delivered nationwide.",
};

export default function ShopPage() {
    return (
        <ShopClientWrapper>
            <ProductPurchase />
        </ShopClientWrapper>
    );
}
