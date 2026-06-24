/**
 * app/api/orders/verify/route.ts
 *
 * UPDATED — now handles orders with MULTIPLE line items (e.g.
 * 2x 10,000mAh + 1x 20,000mAh in one order), not just a single
 * variant + quantity.
 *
 * *** THIS IS THE SECURITY-CRITICAL STEP. *** (unchanged in
 * principle — see original reasoning below, still applies)
 *
 * Paystack's client-side popup callback is informational only.
 * The only trustworthy confirmation is calling Paystack's
 * server-side Verify Transaction endpoint using the SECRET key
 * and checking the response.
 *
 * Flow:
 *   1. Receive { reference } from frontend
 *   2. Call Paystack GET /transaction/verify/:reference
 *   3. Confirm status === "success" AND the amount matches what
 *      we calculated server-side across ALL line items at
 *      order-initiation time
 *   4. If valid: mark order as paid, send an itemized
 *      confirmation email, log one Sheets row per line item,
 *      return success
 *   5. If invalid/failed: release ALL reserved stock across
 *      every line item, return an error
 *
 * Idempotent — calling twice for the same reference does not
 * double-process (no duplicate emails/sheet rows).
 */

import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { google } from "googleapis";
import { releaseStockBulk, type StockLineItem } from "@/src/lib/stock";

const redis = Redis.fromEnv();

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

async function verifyWithPaystack(
    reference: string,
): Promise<PaystackVerifyResponse> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
            method: "GET",
            headers: { Authorization: `Bearer ${secretKey}` },
        },
    );

    return response.json();
}

function formatNaira(n: number): string {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(n);
}

async function sendOrderConfirmationEmail(
    order: PendingOrder,
    paystackRef: string,
): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.NOTIFICATION_EMAIL;

    if (!apiKey || !toEmail) {
        console.warn(
            "Resend not configured — skipping order confirmation email",
        );
        return;
    }

    const resend = new Resend(apiKey);
    const fromAddress =
        process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    const timestamp = new Date().toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "full",
        timeStyle: "short",
    });

    // Itemized rows — one per line item, replacing the old
    // single "Variant / Qty" field
    const itemRows = order.items
        .map(
            (item) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111111;">
          ${item.productName} — ${item.variantLabel}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #666666; text-align: center;">
          × ${item.quantity}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #111111; text-align: right;">
          ${formatNaira(item.lineTotalNgn)}
        </td>
      </tr>`,
        )
        .join("");

    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
    const productSummary =
        order.items.length === 1
            ? order.items[0].productName
            : `${order.items.length} items`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 540px; margin: 40px auto; background-color: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-top: 3px solid #A30005;">
        <div style="padding: 32px 32px 24px 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <img src="https://network.digitekhub.io/images/DigitekNetworkLogo.png" alt="Digitek Network" width="125" style="display: block; border: 0;" />
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #1a7f37; background-color: #e8f5e9; border: 1px solid #c8e6c9; padding: 4px 8px; border-radius: 4px;">
                  Paid
                </span>
              </td>
            </tr>
          </table>
          <h1 style="margin: 28px 0 0 0; font-size: 22px; font-weight: 800; color: #111111;">
            New Order: ${productSummary}
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #666666;">
            Payment confirmed via Paystack. ${itemCount} item(s) total. Prepare for dispatch.
          </p>
        </div>
        <div style="padding: 0 32px 32px 32px;">
          <div style="background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 6px; padding: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 0 0 12px 0; border-bottom: 1px solid #eeeeee; width: 40%;">
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888888; display: block;">Order Ref</span>
                  <strong style="font-size: 13px; color: #111111;">${order.reference}</strong>
                </td>
                <td style="padding: 0 0 12px 16px; border-bottom: 1px solid #eeeeee; width: 60%;">
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888888; display: block;">Paystack Ref</span>
                  <strong style="font-size: 13px; color: #333333;">${paystackRef}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; width: 40%;">
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888888; display: block;">Customer</span>
                  <strong style="font-size: 13px; color: #111111;">${order.customerName}</strong>
                </td>
                <td style="padding: 12px 0 12px 16px; border-bottom: 1px solid #eeeeee; width: 60%;">
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888888; display: block;">Phone</span>
                  <strong style="font-size: 13px; color: #333333;">${order.customerPhone}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; width: 40%;">
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888888; display: block;">Email</span>
                  <strong style="font-size: 13px; color: #111111;">${order.customerEmail}</strong>
                </td>
                <td style="padding: 12px 0 12px 16px; border-bottom: 1px solid #eeeeee; width: 60%;">
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888888; display: block;">Delivery Address</span>
                  <strong style="font-size: 13px; color: #333333;">${order.deliveryAddress}</strong>
                </td>
              </tr>
            </table>
          </div>

          <!-- Itemized order table -->
          <div style="margin-top: 16px; padding: 16px 20px; background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888888; display: block; margin-bottom: 10px;">Items</span>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemRows}
              <tr>
                <td style="padding: 10px 0 0 0; font-size: 13px; color: #666666;">Delivery</td>
                <td></td>
                <td style="padding: 10px 0 0 0; font-size: 13px; color: #666666; text-align: right;">${formatNaira(order.deliveryFeeNgn)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0 0 0; font-size: 14px; font-weight: 700; color: #111111;">Total Paid</td>
                <td></td>
                <td style="padding: 8px 0 0 0; font-size: 14px; font-weight: 700; color: #1a7f37; text-align: right;">${formatNaira(order.totalNgn)}</td>
              </tr>
            </table>
          </div>
        </div>
        <div style="padding: 20px 32px; background-color: #fdfdfd; border-top: 1px solid #f0f0f0;">
          <p style="margin: 0; font-size: 11px; color: #999999;">
            Automated message from <span style="font-weight: 700; color: #666666;">Digitek Network</span> shop. Confirmed ${timestamp}. Please prepare this order for delivery.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    const result = await resend.emails.send({
        from: `Digitek Orders <${fromAddress}>`,
        to: toEmail,
        subject: `[Order] ${productSummary} (${itemCount} item${itemCount > 1 ? "s" : ""}) — ${formatNaira(order.totalNgn)}`,
        html,
        replyTo: order.customerEmail,
    });

    if (result.error) {
        console.error("Order email error:", result.error);
    }
}

async function appendOrderToSheet(
    order: PendingOrder,
    paystackRef: string,
): Promise<void> {
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!sheetId || !keyRaw) {
        console.warn(
            "Google Sheets not configured — skipping order sheet append",
        );
        return;
    }

    let credentials: { client_email: string; private_key: string };
    try {
        credentials = JSON.parse(keyRaw);
    } catch {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY");
        return;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const timestamp = new Date().toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "short",
        timeStyle: "short",
    });

    // One row PER LINE ITEM, all sharing the same Order Ref so
    // they can be grouped/filtered in the sheet. The delivery fee
    // and total are only shown on the first row to avoid
    // double-counting if someone sums the "Total" column.
    const rows = order.items.map((item, index) => [
        timestamp,
        order.reference,
        paystackRef,
        item.productName,
        item.variantLabel,
        item.quantity,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.deliveryAddress,
        index === 0 ? order.totalNgn : "", // total only on first row
        "Paid",
    ]);

    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Orders!A:L",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: rows },
    });
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

        const { reference } = body as { reference?: string };
        if (!reference) {
            return NextResponse.json(
                { error: "Reference is required" },
                { status: 400 },
            );
        }

        // ── Recall what we actually expect this order to be ───
        // (never trust amounts/details from the client at this point)

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

        // Build the stock line items once — reused by both failure
        // paths below if we need to release the reservation
        const stockItems: StockLineItem[] = order.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
        }));

        // ── Idempotency check — already processed? ─────────────

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

        // ── Verify with Paystack using the SECRET key ─────────

        const verification = await verifyWithPaystack(reference);

        if (!verification.status || verification.data?.status !== "success") {
            // Payment did not succeed — release stock for EVERY line
            // item back into the pool
            await releaseStockBulk(stockItems);
            await redis.del(`order:${reference}`);

            return NextResponse.json(
                {
                    error: "Payment could not be verified. No charge was confirmed.",
                },
                { status: 402 },
            );
        }

        // ── Amount tamper check ─────────────────────────────────
        // Confirms the amount Paystack actually charged matches the
        // sum across all line items + delivery, calculated
        // server-side at initiation

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

        // ── Success — mark paid, notify, log ───────────────────

        await redis.set(`order-paid:${reference}`, "true", {
            ex: 60 * 60 * 24 * 90,
        });

        const paystackRef = verification.data.reference;

        const [emailResult, sheetResult] = await Promise.allSettled([
            sendOrderConfirmationEmail(order, paystackRef),
            appendOrderToSheet(order, paystackRef),
        ]);

        if (emailResult.status === "rejected") {
            console.error("Order email failed:", emailResult.reason);
        }
        if (sheetResult.status === "rejected") {
            console.error("Order sheet append failed:", sheetResult.reason);
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
