/**
 * lib/products.ts
 *
 * Product catalog. Single product (power bank), two variants
 * (10000mAh, 20000mAh). Structured as an array + variant map so
 * adding more products later doesn't require restructuring —
 * just add another entry to PRODUCTS.
 *
 * Prices are in Naira (NGN), stored as whole numbers (kobo-free)
 * for simplicity in the UI; converted to kobo only at the
 * Paystack API boundary (Paystack's amount field is in kobo).
 *
 * DELIVERY FEE: flat ₦3,500 for now (DELIVERY_FEE_NGN below).
 * When zone-based delivery is needed later, replace this
 * constant with a lookup function getDeliveryFee(area) and
 * update CheckoutForm.tsx + the order-creation route to call it
 * instead of referencing the constant directly. The data shape
 * elsewhere doesn't need to change.
 */

export type ProductVariant = {
    id: string; // unique key, used in Redis stock keys + Paystack metadata
    label: string; // e.g. "10,000mAh"
    priceNgn: number; // whole Naira, e.g. 15000
};

export type Product = {
    id: string;
    name: string;
    description: string;
    images: string[]; // paths under /public
    variants: ProductVariant[];
};

export const PRODUCTS: Product[] = [
    {
        id: "power-bank",
        name: "Digitek PowerBank",
        description:
            "Keep your router and devices running through power outages. Compact, fast-charging, built for Nigerian businesses that can't afford downtime.",
        images: ["/powerBank2.png"],
        variants: [
            { id: "powerbank-10000", label: "10,000mAh", priceNgn: 35000 },
            { id: "powerbank-20000", label: "20,000mAh", priceNgn: 45000 },
        ],
    },
];

// Flat delivery fee — see header comment for how to evolve this
// into zone-based pricing later.
export const DELIVERY_FEE_NGN = 3500;

// ── Helpers ──────────────────────────────────────────────

export function findProduct(productId: string): Product | undefined {
    return PRODUCTS.find((p) => p.id === productId);
}

export function findVariant(
    productId: string,
    variantId: string,
): { product: Product; variant: ProductVariant } | undefined {
    const product = findProduct(productId);
    if (!product) return undefined;

    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return undefined;

    return { product, variant };
}

export function nairaToKobo(amountNgn: number): number {
    return Math.round(amountNgn * 100);
}

export function formatNaira(amountNgn: number): string {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amountNgn);
}
