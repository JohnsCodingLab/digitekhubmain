/**
 * components/sections/ProductPurchase.tsx
 *
 * UPDATED — switched from raw window.PaystackPop to the
 * react-paystack package (usePaystackPayment hook). Fixes a
 * CSP (Content Security Policy) error some sites hit with the
 * manual <script> + global object approach.
 *
 * ARCHITECTURE NOTE ON WHY THIS LOOKS DIFFERENT NOW:
 * usePaystackPayment() is a React hook — it can only be called
 * in a component body, and its config (reference, amount, email)
 * must be known at the time it's set up. But we don't know the
 * reference/amount until AFTER calling /api/orders/initiate
 * (which reserves stock and computes the real total server-side).
 *
 * So the flow is:
 *   1. Customer submits the checkout form
 *   2. initiateOrder() is called (lib/checkout.ts) — reserves
 *      stock, returns { reference, amountKobo, email }
 *   3. That result is stored in state → triggers a re-render
 *      with a NEW paystackConfig
 *   4. A useEffect watches for that config becoming ready, and
 *      calls initializePayment(onSuccess, onClose) — opening
 *      the Paystack popup
 *   5. On success, verifyOrder() (server-side check against
 *      Paystack) confirms before showing the success screen
 *
 * This is a little more moving parts than the old direct
 * window.PaystackPop.setup() call, but it's how the hook-based
 * API requires things to be wired, and it avoids the CSP issue
 * tied to manually injecting Paystack's script tag.
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePaystackPayment } from "react-paystack";
import { FaCheck, FaSpinner, FaMinus, FaPlus, FaTruck } from "react-icons/fa6";
import { PRODUCTS, DELIVERY_FEE_NGN, formatNaira } from "@/src/lib/product";
import {
    initiateOrder,
    verifyOrder,
    type CartLineItem,
    type CheckoutState,
} from "@/src/lib/checkout";

const PRODUCT = PRODUCTS[0]; // single-product catalog for now

interface PaystackConfig {
    reference: string;
    email: string;
    amount: number; // kobo
    publicKey: string;
}

export function ProductPurchase() {
    const [quantities, setQuantities] = useState<Record<string, number>>(() =>
        Object.fromEntries(PRODUCT.variants.map((v) => [v.id, 0])),
    );

    const [stock, setStock] = useState<Record<string, number>>({});
    const [stockLoading, setStockLoading] = useState(true);

    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");

    const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    // Becomes non-null once initiateOrder() succeeds — its
    // presence is what triggers the Paystack popup via useEffect
    const [paystackConfig, setPaystackConfig] = useState<PaystackConfig | null>(
        null,
    );

    const initializePayment = usePaystackPayment(
        paystackConfig ?? {
            // Placeholder config so the hook always has something
            // valid to initialize with — initializePayment() is only
            // ever actually invoked once paystackConfig is real
            // (guarded in the useEffect below), so this branch never
            // opens a popup with bogus data.
            reference: "",
            email: "",
            amount: 0,
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
        },
    );

    const isProcessing =
        checkoutState === "initiating" ||
        checkoutState === "awaiting-payment" ||
        checkoutState === "verifying";

    // ── Fetch live stock on mount ────────────────────────────

    useEffect(() => {
        let cancelled = false;

        async function fetchStock() {
            try {
                const res = await fetch("/api/stock");
                const data = await res.json();
                if (!cancelled && data.stock) {
                    setStock(data.stock);
                }
            } catch {
                // Stock display is advisory; real enforcement is
                // server-side regardless
            } finally {
                if (!cancelled) setStockLoading(false);
            }
        }

        fetchStock();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        setQuantities((prev) => {
            let changed = false;
            const next = { ...prev };
            for (const variant of PRODUCT.variants) {
                const max = Math.min(10, stock[variant.id] ?? 10);
                if (next[variant.id] > max) {
                    next[variant.id] = Math.max(0, max);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [stock]);

    // ── Derived: line items, totals ──────────────────────────

    const lineItems = useMemo(
        () =>
            PRODUCT.variants
                .map((variant) => ({
                    variant,
                    quantity: quantities[variant.id] ?? 0,
                }))
                .filter((line) => line.quantity > 0),
        [quantities],
    );

    const subtotal = lineItems.reduce(
        (sum, line) => sum + line.variant.priceNgn * line.quantity,
        0,
    );
    const total = lineItems.length > 0 ? subtotal + DELIVERY_FEE_NGN : 0;
    const hasItems = lineItems.length > 0;
    const totalUnitsOrdered = lineItems.reduce((sum, l) => sum + l.quantity, 0);

    // ── Handlers ─────────────────────────────────────────────

    const adjustQuantity = (variantId: string, delta: number) => {
        setQuantities((prev) => {
            const variantStock = stock[variantId] ?? 10;
            const max = Math.min(10, variantStock);
            const current = prev[variantId] ?? 0;
            const next = Math.max(0, Math.min(max, current + delta));
            return { ...prev, [variantId]: next };
        });
    };

    const handleProceedToCheckout = () => {
        if (!hasItems) return;
        setShowCheckoutForm(true);
    };

    // Step 1: reserve stock + create the order. On success, this
    // sets paystackConfig — which the useEffect below picks up to
    // actually open the popup (see architecture note at the top).
    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasItems) return;

        setCheckoutState("initiating");
        setCheckoutError(null);

        const items: CartLineItem[] = lineItems.map((line) => ({
            productId: PRODUCT.id,
            variantId: line.variant.id,
            quantity: line.quantity,
        }));

        const result = await initiateOrder({
            items,
            customerName,
            customerEmail,
            customerPhone,
            deliveryAddress,
        });

        if (
            !result.success ||
            !result.reference ||
            !result.amountKobo ||
            !result.email
        ) {
            setCheckoutError(
                result.error ?? "Could not start checkout. Please try again.",
            );
            setCheckoutState("error");
            return;
        }

        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        if (!publicKey) {
            setCheckoutError(
                "Payment system is not configured. Please contact support.",
            );
            setCheckoutState("error");
            return;
        }

        // This state update triggers a re-render with the real
        // config, which the useEffect below detects and acts on
        setPaystackConfig({
            reference: result.reference,
            email: result.email,
            amount: result.amountKobo,
            publicKey,
        });
    };

    // Step 2: once paystackConfig becomes a real (non-null) value
    // AND initializePayment has been re-created with that config
    // (it's re-created every render since it depends on
    // paystackConfig), open the popup.
    //
    // Guarded by checkoutState to ensure this only fires once per
    // order — without that guard, any re-render while
    // paystackConfig is set would try to reopen the popup.
    const hasOpenedPopupRef = React.useRef(false);

    useEffect(() => {
        if (!paystackConfig || hasOpenedPopupRef.current) return;
        hasOpenedPopupRef.current = true;

        setCheckoutState("awaiting-payment");

        const onSuccess = async (response: { reference: string }) => {
            // Paystack's popup says "done" — this is NOT proof of
            // payment. Verify server-side before treating as success.
            setCheckoutState("verifying");

            const verifyResult = await verifyOrder(response.reference);

            if (!verifyResult.success) {
                setCheckoutError(
                    verifyResult.error ?? "Payment could not be verified.",
                );
                setCheckoutState("error");
                return;
            }

            setCheckoutState("success");
        };

        const onClose = () => {
            // Popup dismissed without completing — order stays
            // pending in Redis and expires after 30 minutes (see
            // SHOP_SETUP.txt for the cleanup approach)
            setCheckoutState((current) =>
                current === "success" ? current : "idle",
            );
            hasOpenedPopupRef.current = false;
            setPaystackConfig(null);
        };

        initializePayment({ onSuccess, onClose });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paystackConfig]);

    const handleStartOver = () => {
        setCheckoutState("idle");
        setCheckoutError(null);
        setPaystackConfig(null);
        hasOpenedPopupRef.current = false;
        setShowCheckoutForm(false);
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setDeliveryAddress("");
        setQuantities(
            Object.fromEntries(PRODUCT.variants.map((v) => [v.id, 0])),
        );
        setStockLoading(true);
        fetch("/api/stock")
            .then((r) => r.json())
            .then((data) => data.stock && setStock(data.stock))
            .finally(() => setStockLoading(false));
    };

    // ── Success state ───────────────────────────────────────

    if (checkoutState === "success") {
        return (
            <div
                className="max-w-lg mx-auto p-8 rounded-[var(--radius-xl)]
                   bg-[var(--overlay-soft)] border border-[var(--overlay-border-soft)] text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-16 h-16 mx-auto rounded-full bg-emerald-400/15 text-emerald-400
                     flex items-center justify-center mb-5"
                >
                    <FaCheck size={26} />
                </motion.div>
                <h3 className="text-h3 text-[var(--color-text-primary)] mb-2">
                    Order confirmed!
                </h3>
                <p className="text-body text-[var(--overlay-text-muted)] mb-1">
                    Thank you, {customerName.split(" ")[0]}. Your order will be
                    delivered to:
                </p>
                <p className="text-body-sm text-[var(--overlay-text-subtle)] mb-6">
                    {deliveryAddress}
                </p>
                <p className="text-caption text-[var(--overlay-text-faint)] mb-6">
                    A confirmation has been sent to {customerEmail}. Our team
                    will reach out to coordinate delivery.
                </p>
                <button
                    onClick={handleStartOver}
                    className="text-body-sm text-[var(--color-brand)] hover:underline"
                >
                    Place another order
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left — product info */}
            <div>
                <div
                    className="aspect-square rounded-[var(--radius-xl)] bg-[var(--overlay-soft)]
                       flex items-center justify-center mb-6 overflow-hidden"
                >
                    <img
                        src={PRODUCT.images[0]}
                        alt={PRODUCT.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <h1 className="text-h2 text-[var(--color-text-primary)] mb-3">
                    {PRODUCT.name}
                </h1>
                <p className="text-body text-[var(--overlay-text-muted)] leading-relaxed">
                    {PRODUCT.description}
                </p>
                <div className="flex items-center gap-2.5 mt-5 text-body-sm text-[var(--overlay-text-subtle)]">
                    <FaTruck size={14} aria-hidden="true" />
                    Delivery: {formatNaira(DELIVERY_FEE_NGN)} flat rate,
                    nationwide
                </div>
            </div>

            {/* Right — purchase panel */}
            <div className="p-7 rounded-[var(--radius-xl)] bg-[var(--overlay-soft)]">
                <AnimatePresence mode="wait">
                    {!showCheckoutForm ? (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="text-label text-[var(--overlay-text-muted)] mb-3">
                                Choose quantity per capacity
                            </p>
                            <div className="flex flex-col gap-3 mb-6">
                                {PRODUCT.variants.map((variant) => {
                                    const variantStock = stock[variant.id] ?? 0;
                                    const variantSoldOut =
                                        !stockLoading && variantStock <= 0;
                                    const qty = quantities[variant.id] ?? 0;
                                    const maxQty = Math.min(
                                        10,
                                        variantStock || 10,
                                    );

                                    return (
                                        <div
                                            key={variant.id}
                                            className={`flex items-center justify-between gap-4 p-4
                                 rounded-[var(--radius-md)] border transition-colors duration-150
                                 ${
                                     qty > 0
                                         ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10"
                                         : "border-[var(--overlay-border-soft)]"
                                 }`}
                                        >
                                            <div className="min-w-0">
                                                <p className="text-body font-semibold text-[var(--color-text-primary)]">
                                                    {variant.label}
                                                </p>
                                                <p className="text-body-sm text-[var(--overlay-text-muted)]">
                                                    {formatNaira(
                                                        variant.priceNgn,
                                                    )}
                                                </p>
                                                <p
                                                    className={`text-caption mt-0.5 ${
                                                        variantSoldOut
                                                            ? "text-red-400"
                                                            : "text-[var(--overlay-text-faint)]"
                                                    }`}
                                                >
                                                    {stockLoading
                                                        ? "Checking stock..."
                                                        : variantSoldOut
                                                          ? "Out of stock"
                                                          : variantStock <= 5
                                                            ? `Only ${variantStock} left`
                                                            : "In stock"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        adjustQuantity(
                                                            variant.id,
                                                            -1,
                                                        )
                                                    }
                                                    disabled={
                                                        qty <= 0 ||
                                                        variantSoldOut
                                                    }
                                                    aria-label={`Decrease ${variant.label} quantity`}
                                                    className="w-9 h-9 rounded-full border border-[var(--overlay-border-medium)]
                                     flex items-center justify-center text-[var(--overlay-text-strong)]
                                     hover:border-[var(--overlay-border-medium)] disabled:opacity-30 transition-colors"
                                                >
                                                    <FaMinus size={11} />
                                                </button>
                                                <span className="text-body font-semibold text-[var(--color-text-primary)] w-6 text-center">
                                                    {qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        adjustQuantity(
                                                            variant.id,
                                                            1,
                                                        )
                                                    }
                                                    disabled={
                                                        qty >= maxQty ||
                                                        variantSoldOut
                                                    }
                                                    aria-label={`Increase ${variant.label} quantity`}
                                                    className="w-9 h-9 rounded-full border border-[var(--overlay-border-medium)]
                                     flex items-center justify-center text-[var(--overlay-text-strong)]
                                     hover:border-[var(--overlay-border-medium)] disabled:opacity-30 transition-colors"
                                                >
                                                    <FaPlus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {hasItems ? (
                                <div className="border-t border-[var(--overlay-border-soft)] pt-5 mb-6 flex flex-col gap-2">
                                    {lineItems.map((line) => (
                                        <div
                                            key={line.variant.id}
                                            className="flex justify-between text-body-sm text-[var(--overlay-text-muted)]"
                                        >
                                            <span>
                                                {line.variant.label} ×{" "}
                                                {line.quantity}
                                            </span>
                                            <span>
                                                {formatNaira(
                                                    line.variant.priceNgn *
                                                        line.quantity,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between text-body-sm text-[var(--overlay-text-muted)]">
                                        <span>Delivery</span>
                                        <span>
                                            {formatNaira(DELIVERY_FEE_NGN)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-body font-semibold text-[var(--color-text-primary)] pt-2 border-t border-[var(--overlay-border-soft)]">
                                        <span>
                                            Total ({totalUnitsOrdered} item
                                            {totalUnitsOrdered !== 1 ? "s" : ""}
                                            )
                                        </span>
                                        <span>{formatNaira(total)}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-body-sm text-[var(--overlay-text-faint)] text-center py-4 mb-2">
                                    Select a quantity above to get started
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleProceedToCheckout}
                                disabled={!hasItems || stockLoading}
                                className="btn-sweep w-full bg-[var(--color-brand)] text-white
                           px-5 py-3.5 rounded-[var(--radius-md)] text-sm font-semibold
                           disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {hasItems
                                    ? "Proceed to Checkout"
                                    : "Select Items First"}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="checkout"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowCheckoutForm(false)}
                                disabled={isProcessing}
                                className="text-body-sm text-[var(--overlay-text-subtle)] hover:text-[var(--overlay-text-strong)] mb-5 disabled:opacity-30"
                            >
                                ← Back
                            </button>

                            <div className="flex flex-col gap-1.5 mb-5 pb-5 border-b border-[var(--overlay-border-soft)]">
                                {lineItems.map((line) => (
                                    <div
                                        key={line.variant.id}
                                        className="flex justify-between text-body-sm text-[var(--overlay-text-muted)]"
                                    >
                                        <span>
                                            {line.variant.label} ×{" "}
                                            {line.quantity}
                                        </span>
                                        <span>
                                            {formatNaira(
                                                line.variant.priceNgn *
                                                    line.quantity,
                                            )}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-body font-semibold text-[var(--color-text-primary)] pt-1">
                                    <span>Total (incl. delivery)</span>
                                    <span>{formatNaira(total)}</span>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmitOrder}
                                className="flex flex-col gap-3"
                            >
                                <input
                                    type="text"
                                    required
                                    placeholder="Full name"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    aria-label="Full name"
                                    className="w-full px-4 py-3 rounded-[var(--radius-md)]
                             form-input text-body-sm
                             focus:outline-none focus:border-[var(--color-brand)]/50
                             disabled:opacity-50 transition-colors duration-150"
                                />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    value={customerEmail}
                                    onChange={(e) =>
                                        setCustomerEmail(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    aria-label="Email address"
                                    className="w-full px-4 py-3 rounded-[var(--radius-md)]
                             form-input text-body-sm
                             focus:outline-none focus:border-[var(--color-brand)]/50
                             disabled:opacity-50 transition-colors duration-150"
                                />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Phone number"
                                    value={customerPhone}
                                    onChange={(e) =>
                                        setCustomerPhone(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    aria-label="Phone number"
                                    className="w-full px-4 py-3 rounded-[var(--radius-md)]
                             form-input text-body-sm
                             focus:outline-none focus:border-[var(--color-brand)]/50
                             disabled:opacity-50 transition-colors duration-150"
                                />
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Delivery address (street, area, city, state)"
                                    value={deliveryAddress}
                                    onChange={(e) =>
                                        setDeliveryAddress(e.target.value)
                                    }
                                    disabled={isProcessing}
                                    aria-label="Delivery address"
                                    className="w-full px-4 py-3 rounded-[var(--radius-md)]
                             form-input text-body-sm leading-relaxed
                             focus:outline-none focus:border-[var(--color-brand)]/50
                             disabled:opacity-50 transition-colors duration-150 resize-none"
                                />

                                {checkoutState === "error" && checkoutError && (
                                    <p
                                        className="text-body-sm text-red-400"
                                        role="alert"
                                    >
                                        {checkoutError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="btn-sweep bg-[var(--color-brand)] text-white
                             px-5 py-3.5 rounded-[var(--radius-md)] text-sm font-semibold mt-1
                             disabled:opacity-60 disabled:pointer-events-none
                             flex items-center justify-center gap-2"
                                >
                                    {checkoutState === "initiating" && (
                                        <>
                                            <FaSpinner
                                                className="animate-spin"
                                                size={14}
                                            />{" "}
                                            Preparing order...
                                        </>
                                    )}
                                    {checkoutState === "awaiting-payment" && (
                                        <>
                                            <FaSpinner
                                                className="animate-spin"
                                                size={14}
                                            />{" "}
                                            Complete payment in popup...
                                        </>
                                    )}
                                    {checkoutState === "verifying" && (
                                        <>
                                            <FaSpinner
                                                className="animate-spin"
                                                size={14}
                                            />{" "}
                                            Confirming payment...
                                        </>
                                    )}
                                    {(checkoutState === "idle" ||
                                        checkoutState === "error") &&
                                        `Pay ${formatNaira(total)}`}
                                </button>

                                <p className="text-caption text-[var(--overlay-text-faint)] text-center">
                                    🔒 Secure payment via Paystack. Your card
                                    details are never stored on our servers.
                                </p>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
