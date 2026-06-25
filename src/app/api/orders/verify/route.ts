/**
 * app/api/orders/verify/route.ts
 *
 * UPDATED — Resend and Google Sheets removed.
 * On confirmed payment, order data is sent to the n8n webhook
 * which routes to Zepto Mail, Slack, and any other downstream
 * systems the automation specialist configures.
 *
 * *** SECURITY-CRITICAL SECTION UNCHANGED ***
 * Paystack server-side verification and amount tamper check
 * are fully preserved — see inline comments.
 *
 * One env var required (same as leads route):
 *   N8N_WEBHOOK_URL=https://digitekhub.app.n8n.cloud/webhook/7d768a39-e28e-4c5f-bafa-5aa2a08675ea
 *
 * Payload shape sent to n8n on confirmed order:
 * {
 *   type:            "order",
 *   event:           "payment_confirmed",
 *   reference:       string,
 *   paystackRef:     string,
 *   timestamp:       string,
 *   customerName:    string,
 *   customerEmail:   string,
 *   customerPhone:   string,
 *   deliveryAddress: string,
 *   items: [{ productName, variantLabel, quantity, unitPriceNgn, lineTotalNgn }],
 *   subtotalNgn:     number,
 *   deliveryFeeNgn:  number,
 *   totalNgn:        number,
 *   totalFormatted:  string,  // e.g. "₦28,500"
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { releaseStockBulk, type StockLineItem } from "@/src/lib/stock";

const redis = Redis.fromEnv();

// ── Types ────────────────────────────────────────────────

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

interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data?: {
        status: string;
        amount: number; // in kobo
        reference: string;
        paid_at?: string;
        channel?: string;
    };
}

// ── Paystack verification ─────────────────────────────────

async function verifyWithPaystack(
    reference: string,
): Promise<PaystackVerifyResponse> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not configured");

    const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
            method: "GET",
            headers: { Authorization: `Bearer ${secretKey}` },
        },
    );

    return response.json();
}

// ── Webhook notification ──────────────────────────────────

async function notifyWebhook(
    order: PendingOrder,
    paystackRef: string,
): Promise<void> {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("N8N_WEBHOOK_URL not configured — skipping webhook");
        return;
    }

    const timestamp = new Date().toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "full",
        timeStyle: "short",
    });

    const totalFormatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(order.totalNgn);

    const webhookBody = {
        type: "order",
        event: "payment_confirmed",
        reference: order.reference,
        paystackRef,
        timestamp,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        items: order.items.map((item) => ({
            productName: item.productName,
            variantLabel: item.variantLabel,
            quantity: item.quantity,
            unitPriceNgn: item.unitPriceNgn,
            lineTotalNgn: item.lineTotalNgn,
        })),
        subtotalNgn: order.subtotalNgn,
        deliveryFeeNgn: order.deliveryFeeNgn,
        totalNgn: order.totalNgn,
        totalFormatted,
    };

    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookBody),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Webhook failed: ${response.status} ${text}`);
    }
}

// ── Handler ───────────────────────────────────────────────

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

        const { reference } = body as { reference?: string };
        if (!reference) {
            return NextResponse.json(
                { error: "Reference is required" },
                { status: 400 },
            );
        }

        // Recall server-side order — never trust client data at this point
        const orderRaw = await redis.get<string>(`order:${reference}`);
        if (!orderRaw) {
            return NextResponse.json(
                {
                    error: "Order not found or expired. Please contact support with your reference.",
                },
                { status: 404 },
            );
        }

        const order: PendingOrder =
            typeof orderRaw === "string" ? JSON.parse(orderRaw) : orderRaw;

        const stockItems: StockLineItem[] = order.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
        }));

        // ── Idempotency check ──────────────────────────────────
        const alreadyPaid = await redis.get(`order-paid:${reference}`);
        if (alreadyPaid) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Order already confirmed",
                    reference,
                },
                { status: 200 },
            );
        }

        // ── Verify with Paystack SECRET key ────────────────────
        // This is the security-critical step — never trust the
        // client's payment callback alone.
        const verification = await verifyWithPaystack(reference);

        if (!verification.status || verification.data?.status !== "success") {
            await releaseStockBulk(stockItems);
            await redis.del(`order:${reference}`);
            return NextResponse.json(
                {
                    error: "Payment could not be verified. No charge was confirmed.",
                },
                { status: 402 },
            );
        }

        // ── Amount tamper check ────────────────────────────────
        // Confirm Paystack's confirmed amount matches what we
        // calculated server-side — closes a tampering vector
        // where a manipulated client pays a smaller amount.
        const { nairaToKobo } = await import("@/src/lib/product");
        const expectedKobo = nairaToKobo(order.totalNgn);

        if (verification.data.amount !== expectedKobo) {
            console.error(
                `Amount mismatch for ${reference}: expected ${expectedKobo} kobo, got ${verification.data.amount} kobo`,
            );
            await releaseStockBulk(stockItems);
            await redis.del(`order:${reference}`);
            return NextResponse.json(
                { error: "Payment amount mismatch. Please contact support." },
                { status: 402 },
            );
        }

        // ── Mark paid + notify ─────────────────────────────────
        await redis.set(`order-paid:${reference}`, "true", {
            ex: 60 * 60 * 24 * 90,
        });

        const paystackRef = verification.data.reference;

        try {
            await notifyWebhook(order, paystackRef);
        } catch (err) {
            // Payment is confirmed regardless — webhook is external.
            // Log but don't fail the response.
            console.error("Order webhook notification failed:", err);
        }

        return NextResponse.json(
            {
                success: true,
                reference,
                message: "Payment verified and order confirmed",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Order verification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
