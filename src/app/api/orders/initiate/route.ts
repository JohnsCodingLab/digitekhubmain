/**
 * app/api/orders/initiate/route.ts
 *
 * UPDATED — now accepts MULTIPLE line items per order (e.g.
 * 2x 10,000mAh + 1x 20,000mAh in a single checkout), not just
 * one variant + quantity.
 *
 * Responsibilities (unchanged in spirit, extended to handle
 * an array):
 *   1. Validate the order (each item's variant exists, quantity
 *      sane, customer details present)
 *   2. Atomically reserve stock for ALL line items — all or
 *      nothing (see reserveStockBulk in lib/stock.ts)
 *   3. Generate a unique order reference
 *   4. Store the pending order (with all line items) server-side
 *      so the verify step uses this data, never anything the
 *      client could tamper with after payment
 *   5. Return the reference + total amount (in kobo) for the
 *      frontend to open the Paystack popup with
 *
 * If stock reservation fails for ANY item, no payment is
 * initiated — the customer is told which variant is short.
 */

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { findVariant, nairaToKobo, DELIVERY_FEE_NGN } from "@/src/lib/product";
import {
    reserveStockBulk,
    releaseStockBulk,
    type StockLineItem,
} from "@/src/lib/stock";

const redis = Redis.fromEnv();

const PENDING_ORDER_TTL_SECONDS = 30 * 60;
const MAX_LINE_ITEMS = 10; // sanity cap on distinct variants per order
const MAX_QUANTITY_PER_ITEM = 10;

interface CartItemInput {
    productId: string;
    variantId: string;
    quantity: number;
}

interface InitiateOrderBody {
    items: CartItemInput[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
}

// Stored server-side per line item — resolved product/variant
// details, not just IDs, so the verify step never needs to
// re-look-up pricing (and can't be fooled by a since-changed price)
interface PendingOrderLineItem {
    productId: string;
    productName: string;
    variantId: string;
    variantLabel: string;
    quantity: number;
    unitPriceNgn: number;
    lineTotalNgn: number;
}

interface PendingOrder {
    reference: string;
    items: PendingOrderLineItem[];
    subtotalNgn: number;
    deliveryFeeNgn: number;
    totalNgn: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    createdAt: string;
}

function generateOrderRef(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `DTK-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
    try {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400 },
            );
        }

        const b = body as Partial<InitiateOrderBody>;

        // ── Validation ──────────────────────────────────────

        if (!Array.isArray(b.items) || b.items.length === 0) {
            return NextResponse.json(
                { error: "At least one item is required" },
                { status: 400 },
            );
        }

        if (b.items.length > MAX_LINE_ITEMS) {
            return NextResponse.json(
                {
                    error: `Orders are limited to ${MAX_LINE_ITEMS} distinct items`,
                },
                { status: 400 },
            );
        }

        if (
            !b.customerName ||
            !b.customerEmail ||
            !b.customerPhone ||
            !b.deliveryAddress
        ) {
            return NextResponse.json(
                {
                    error: "Name, email, phone, and delivery address are required",
                },
                { status: 400 },
            );
        }

        // Resolve + validate every line item against the real catalog
        const resolvedItems: PendingOrderLineItem[] = [];

        for (const rawItem of b.items) {
            if (!rawItem.productId || !rawItem.variantId) {
                return NextResponse.json(
                    { error: "Each item must include a product and variant" },
                    { status: 400 },
                );
            }

            const quantity = Number(rawItem.quantity);
            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > MAX_QUANTITY_PER_ITEM
            ) {
                return NextResponse.json(
                    {
                        error: `Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM} per item`,
                    },
                    { status: 400 },
                );
            }

            const found = findVariant(rawItem.productId, rawItem.variantId);
            if (!found) {
                return NextResponse.json(
                    {
                        error: `Product or variant not found: ${rawItem.variantId}`,
                    },
                    { status: 404 },
                );
            }

            const { product, variant } = found;

            resolvedItems.push({
                productId: product.id,
                productName: product.name,
                variantId: variant.id,
                variantLabel: variant.label,
                quantity,
                unitPriceNgn: variant.priceNgn,
                lineTotalNgn: variant.priceNgn * quantity,
            });
        }

        // Guard against duplicate variant entries in the same request
        // (e.g. the same variant submitted twice) — merge them so
        // stock reservation only happens once per variant
        const mergedByVariant = new Map<string, PendingOrderLineItem>();
        for (const item of resolvedItems) {
            const existing = mergedByVariant.get(item.variantId);
            if (existing) {
                existing.quantity += item.quantity;
                existing.lineTotalNgn += item.lineTotalNgn;
            } else {
                mergedByVariant.set(item.variantId, { ...item });
            }
        }
        const finalItems = Array.from(mergedByVariant.values());

        // ── Reserve stock atomically across ALL line items ──────
        // All-or-nothing: if any variant is short, nothing is
        // reserved and the customer is told which one

        const stockRequest: StockLineItem[] = finalItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
        }));

        const reservation = await reserveStockBulk(stockRequest);

        if (!reservation.success) {
            const failedItem = finalItems.find(
                (i) => i.variantId === reservation.failedVariantId,
            );
            return NextResponse.json(
                {
                    error: failedItem
                        ? `Sorry, we don't have enough ${failedItem.variantLabel} available right now.`
                        : "One or more items are no longer available in the requested quantity.",
                },
                { status: 409 },
            );
        }

        // ── Build order ───────────────────────────────────────

        const reference = generateOrderRef();
        const subtotalNgn = finalItems.reduce(
            (sum, item) => sum + item.lineTotalNgn,
            0,
        );
        const totalNgn = subtotalNgn + DELIVERY_FEE_NGN;

        const pendingOrder: PendingOrder = {
            reference,
            items: finalItems,
            subtotalNgn,
            deliveryFeeNgn: DELIVERY_FEE_NGN,
            totalNgn,
            customerName: b.customerName.trim(),
            customerEmail: b.customerEmail.trim(),
            customerPhone: b.customerPhone.trim(),
            deliveryAddress: b.deliveryAddress.trim(),
            createdAt: new Date().toISOString(),
        };

        try {
            // Stored server-side so the verify step uses THIS data,
            // never anything the client could tamper with after payment
            await redis.set(
                `order:${reference}`,
                JSON.stringify(pendingOrder),
                {
                    ex: PENDING_ORDER_TTL_SECONDS,
                },
            );
        } catch (storeError) {
            // If we reserved stock but failed to persist the pending
            // order, release the reservation rather than leaving stock
            // locked against an order that was never actually created
            await releaseStockBulk(stockRequest);
            throw storeError;
        }

        return NextResponse.json(
            {
                reference,
                amountKobo: nairaToKobo(totalNgn),
                totalNgn,
                email: pendingOrder.customerEmail,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Order initiation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
