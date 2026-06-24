/**
 * app/api/stock/route.ts
 *
 * Public read-only endpoint — returns current stock for all
 * product variants. Used by the shop page to show "X left" or
 * "Out of stock" and disable purchase for empty variants.
 *
 * No write access here — stock only decreases via reserveStock()
 * inside the order-creation flow after verified payment.
 */

import { NextResponse } from "next/server";
import { getAllStock } from "@/src/lib/stock";
import { PRODUCTS } from "@/src/lib/product";

export async function GET() {
    try {
        const allVariantIds = PRODUCTS.flatMap((p) =>
            p.variants.map((v) => v.id),
        );
        const stock = await getAllStock(allVariantIds);

        return NextResponse.json({ stock }, { status: 200 });
    } catch (error) {
        console.error("Stock fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stock" },
            { status: 500 },
        );
    }
}
