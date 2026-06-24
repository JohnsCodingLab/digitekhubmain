/**
 * lib/checkout.ts
 *
 * UPDATED — switched from the raw Paystack inline script
 * (window.PaystackPop) to the react-paystack package, which
 * fixes a Content Security Policy violation some sites hit
 * with the raw script approach (Paystack's checkout spins up a
 * blob: script internally; react-paystack doesn't change that
 * underlying behavior, but using their maintained hook avoids
 * the manual <script> + global window object pattern that's
 * more fragile against CSP/ad-blocker edge cases).
 *
 * IMPORTANT ARCHITECTURE NOTE:
 * react-paystack's usePaystackPayment is a REACT HOOK — it can
 * only be called inside a component body, not inside an
 * arbitrary async function like the old useCheckout() did. So
 * this file no longer owns the Paystack popup step directly.
 * Instead:
 *
 *   - initiateOrder() and verifyOrder() here are plain async
 *     functions (server calls only, no Paystack SDK involved)
 *   - The component (ProductPurchase.tsx) calls
 *     usePaystackPayment() itself, and calls these two
 *     functions before/after it
 *
 * This is actually a cleaner separation than before — this
 * file no longer needs to know anything about Paystack's
 * client SDK at all, just your own /api/orders endpoints.
 */

export type CheckoutState =
    | "idle"
    | "initiating" // reserving stock, creating order
    | "awaiting-payment" // Paystack popup is open
    | "verifying" // popup closed, confirming with server
    | "success"
    | "error";

export interface CartLineItem {
    productId: string;
    variantId: string;
    quantity: number;
}

export interface CheckoutInput {
    items: CartLineItem[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
}

export interface InitiateResult {
    success: boolean;
    reference?: string;
    amountKobo?: number;
    totalNgn?: number;
    email?: string;
    error?: string;
}

export interface VerifyResult {
    success: boolean;
    reference?: string;
    error?: string;
}

/**
 * Step 1 — reserve stock, create the pending order server-side,
 * get back a reference + amount to hand to Paystack's popup.
 */
export async function initiateOrder(
    input: CheckoutInput,
): Promise<InitiateResult> {
    try {
        const res = await fetch("/api/orders/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                error:
                    data.error ?? "Could not start checkout. Please try again.",
            };
        }

        return {
            success: true,
            reference: data.reference,
            amountKobo: data.amountKobo,
            totalNgn: data.totalNgn,
            email: data.email,
        };
    } catch {
        return {
            success: false,
            error: "Network error. Please check your connection and try again.",
        };
    }
}

/**
 * Step 2 — called after the Paystack popup reports success.
 * This is NOT proof of payment on its own (see security notes
 * in api/orders/verify/route.ts) — it asks the server to
 * independently confirm with Paystack before treating the
 * order as paid.
 */
export async function verifyOrder(reference: string): Promise<VerifyResult> {
    try {
        const res = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference }),
        });

        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                error: data.error ?? "Payment could not be verified.",
            };
        }

        return { success: true, reference };
    } catch {
        return {
            success: false,
            error: "Could not confirm payment. If you were charged, contact support with your reference.",
        };
    }
}
