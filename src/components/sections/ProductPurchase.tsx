/**
 * components/sections/ProductPurchase.tsx
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import PaystackPop from "@paystack/inline-js";
import {
    FaCheck,
    FaSpinner,
    FaMinus,
    FaPlus,
    FaTruck,
    FaLock,
} from "react-icons/fa6";
import { PRODUCTS, DELIVERY_FEE_NGN, formatNaira } from "@/src/lib/product";
import { useTheme } from "../common/useTheme";
import {
    initiateOrder,
    verifyOrder,
    type CartLineItem,
    type CheckoutState,
} from "@/src/lib/checkout";

const PRODUCT = PRODUCTS[0];

export function ProductPurchase() {
    const { isLight } = useTheme();
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

    const isProcessing =
        checkoutState === "initiating" ||
        checkoutState === "awaiting-payment" ||
        checkoutState === "verifying";

    useEffect(() => {
        let cancelled = false;
        async function fetchStock() {
            try {
                const res = await fetch("/api/stock");
                const data = await res.json();
                if (!cancelled && data.stock) setStock(data.stock);
            } catch {
                // advisory fallback
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

        try {
            // Trigger the Paystack Pop gateway directly
            const paystack = new PaystackPop();
            setCheckoutState("awaiting-payment");

            paystack.newTransaction({
                key: publicKey,
                email: result.email,
                amount: result.amountKobo,
                reference: result.reference,
                onSuccess: async (response: { reference: string }) => {
                    setCheckoutState("verifying");
                    const verifyResult = await verifyOrder(response.reference);
                    if (!verifyResult.success) {
                        setCheckoutError(
                            verifyResult.error ??
                                "Payment could not be verified.",
                        );
                        setCheckoutState("error");
                        return;
                    }
                    setCheckoutState("success");
                },
                onCancel: () => {
                    setCheckoutState("idle");
                },
            });
        } catch {
            setCheckoutError("Failed to initialize Paystack gateway.");
            setCheckoutState("error");
        }
    };

    if (checkoutState === "success") {
        return (
            <div
                className={`max-w-lg mx-auto p-8 rounded-[var(--radius-xl)] border shadow-xl text-center backdrop-blur-md transition-all duration-300 ${
                    isLight
                        ? "bg-white border-slate-100 shadow-slate-200/60 text-slate-900"
                        : "bg-white/5 border-white/10 shadow-2xl text-white"
                }`}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20"
                >
                    <FaCheck size={24} />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Order Confirmed!</h3>
                <p
                    className={`text-body mb-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}
                >
                    Thank you, {customerName.split(" ")[0]}. Your order will be
                    delivered to:
                </p>
                <p
                    className={`text-body-sm font-medium p-3 rounded-xl border my-4 ${
                        isLight
                            ? "bg-slate-50 border-slate-100 text-slate-800"
                            : "bg-white/5 border-white/5 text-slate-200"
                    }`}
                >
                    {deliveryAddress}
                </p>
                <p
                    className={`text-caption mb-6 ${isLight ? "text-slate-500" : "text-slate-400"}`}
                >
                    A verification receipt has been cataloged and sent to{" "}
                    {customerEmail}.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left — Visual Showcase Column */}
            <div className="sticky top-24">
                <div
                    className={`relative aspect-square rounded-[var(--radius-2xl)] border p-3 shadow-md overflow-hidden group transition-all duration-300 flex items-center justify-center ${
                        isLight
                            ? "bg-white border-slate-100 shadow-slate-200/50"
                            : "bg-white/5 border-white/10"
                    }`}
                >
                    <Image
                        src={PRODUCT.images[0]}
                        alt={PRODUCT.name}
                        width={500}
                        height={500}
                        priority
                        className="object-cover rounded-[var(--radius-xl)] transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                </div>
                <h1
                    className={`text-3xl font-extrabold tracking-tight mt-8 mb-4 ${isLight ? "text-slate-900" : "text-white"}`}
                >
                    {PRODUCT.name}
                </h1>
                <p
                    className={`text-base leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}
                >
                    {PRODUCT.description}
                </p>
                <div
                    className={`flex items-center gap-3 mt-6 text-sm font-medium w-fit px-4 py-2.5 rounded-full border transition-all duration-300 ${
                        isLight
                            ? "bg-slate-50 border-slate-100 text-slate-600"
                            : "bg-white/5 border-white/5 text-slate-400"
                    }`}
                >
                    <FaTruck size={14} className="text-[var(--color-brand)]" />
                    Delivery: {formatNaira(DELIVERY_FEE_NGN)} Flat Rate
                    Nationwide
                </div>
            </div>

            {/* Right — Transaction & Setup Panel */}
            <div
                className={`p-8 rounded-[var(--radius-2xl)] border shadow-xl backdrop-blur-md transition-all duration-300 ${
                    isLight
                        ? "bg-white border-slate-100 shadow-slate-200/50"
                        : "bg-white/5 border-white/10 shadow-2xl"
                }`}
            >
                <AnimatePresence mode="wait">
                    {!showCheckoutForm ? (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="mb-6">
                                <h3
                                    className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}
                                >
                                    Configure Order
                                </h3>
                                <p
                                    className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}
                                >
                                    Select your desired configurations and
                                    quantities below
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 mb-6">
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
                                            className={`flex items-center justify-between gap-4 p-4.5 rounded-[var(--radius-xl)] border transition-all duration-300 ${
                                                qty > 0
                                                    ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.04] shadow-sm"
                                                    : isLight
                                                      ? "border-slate-100 bg-slate-50/50"
                                                      : "border-white/5 bg-white/[0.02]"
                                            }`}
                                        >
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}
                                                >
                                                    {variant.label}
                                                </p>
                                                <p className="text-sm font-semibold text-[var(--color-brand)] mt-0.5">
                                                    {formatNaira(
                                                        variant.priceNgn,
                                                    )}
                                                </p>
                                                <span
                                                    className={`inline-flex items-center text-[11px] font-medium mt-2 px-2 py-0.5 rounded-full ${
                                                        variantSoldOut
                                                            ? "bg-red-500/10 text-red-500"
                                                            : variantStock <=
                                                                    5 &&
                                                                !stockLoading
                                                              ? "bg-amber-500/10 text-amber-500"
                                                              : isLight
                                                                ? "bg-slate-100 text-slate-600"
                                                                : "bg-white/5 text-slate-400"
                                                    }`}
                                                >
                                                    {stockLoading
                                                        ? "Checking stock..."
                                                        : variantSoldOut
                                                          ? "Out of stock"
                                                          : variantStock <= 5
                                                            ? `Only ${variantStock} left`
                                                            : "In stock"}
                                                </span>
                                            </div>

                                            <div
                                                className={`flex items-center gap-3.5 border p-1.5 rounded-full shadow-inner transition-all duration-300 ${
                                                    isLight
                                                        ? "bg-white border-slate-100"
                                                        : "bg-white/5 border-white/10"
                                                }`}
                                            >
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
                                                    className={`w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30 transition-all shadow-sm ${
                                                        isLight
                                                            ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                            : "border-white/10 text-slate-300 hover:bg-white/10"
                                                    }`}
                                                >
                                                    <FaMinus size={10} />
                                                </button>
                                                <span
                                                    className={`text-sm font-bold w-5 text-center ${isLight ? "text-slate-900" : "text-white"}`}
                                                >
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
                                                    className={`w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-30 transition-all shadow-sm ${
                                                        isLight
                                                            ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                            : "border-white/10 text-slate-300 hover:bg-white/10"
                                                    }`}
                                                >
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {hasItems ? (
                                <div
                                    className={`border rounded-2xl p-5 mb-6 flex flex-col gap-2.5 shadow-sm transition-all duration-300 ${
                                        isLight
                                            ? "bg-slate-50 border-slate-100"
                                            : "bg-white/[0.02] border-white/5"
                                    }`}
                                >
                                    {lineItems.map((line) => (
                                        <div
                                            key={line.variant.id}
                                            className={`flex justify-between text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}
                                        >
                                            <span>
                                                {line.variant.label}{" "}
                                                <span className="text-xs text-slate-400 font-medium">
                                                    × {line.quantity}
                                                </span>
                                            </span>
                                            <span
                                                className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}
                                            >
                                                {formatNaira(
                                                    line.variant.priceNgn *
                                                        line.quantity,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                    <div
                                        className={`flex justify-between text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}
                                    >
                                        <span>Delivery Charge</span>
                                        <span
                                            className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}
                                        >
                                            {formatNaira(DELIVERY_FEE_NGN)}
                                        </span>
                                    </div>
                                    <div
                                        className={`flex justify-between text-base font-bold pt-3 mt-1.5 border-t ${
                                            isLight
                                                ? "text-slate-900 border-slate-200"
                                                : "text-white border-white/10"
                                        }`}
                                    >
                                        <span>
                                            Grand Total ({totalUnitsOrdered}{" "}
                                            items)
                                        </span>
                                        <span className="text-lg text-[var(--color-brand)]">
                                            {formatNaira(total)}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`text-center py-8 mb-4 border border-dashed rounded-2xl ${isLight ? "border-slate-200" : "border-white/10"}`}
                                >
                                    <p className="text-sm text-slate-400 font-medium">
                                        Select a quantity config above to
                                        initiate cart summary.
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleProceedToCheckout}
                                disabled={!hasItems || stockLoading}
                                className="w-full bg-[var(--color-brand)] text-white hover:brightness-105 active:scale-[0.99] transition-all py-4 rounded-[var(--radius-xl)] text-sm font-bold shadow-lg shadow-[var(--color-brand)]/20 disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {hasItems
                                    ? "Proceed to Checkout"
                                    : "Select Items First"}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="checkout"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowCheckoutForm(false)}
                                disabled={isProcessing}
                                className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors mb-6 disabled:opacity-30 inline-block"
                            >
                                ← Return to configs
                            </button>

                            <div
                                className={`border rounded-2xl p-5 mb-6 transition-all duration-300 ${
                                    isLight
                                        ? "bg-slate-50 border-slate-100"
                                        : "bg-white/[0.02] border-white/5"
                                }`}
                            >
                                <div
                                    className={`flex flex-col gap-2 border-b pb-3 mb-3 ${isLight ? "border-slate-200" : "border-white/10"}`}
                                >
                                    {lineItems.map((line) => (
                                        <div
                                            key={line.variant.id}
                                            className="flex justify-between text-xs text-slate-400"
                                        >
                                            <span>
                                                {line.variant.label} ×{" "}
                                                {line.quantity}
                                            </span>
                                            <span
                                                className={`font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
                                            >
                                                {formatNaira(
                                                    line.variant.priceNgn *
                                                        line.quantity,
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div
                                    className={`flex justify-between text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}
                                >
                                    <span>Total (incl. delivery)</span>
                                    <span className="text-[var(--color-brand)]">
                                        {formatNaira(total)}
                                    </span>
                                </div>
                            </div>

                            <form
                                onSubmit={handleSubmitOrder}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex flex-col gap-3.5">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full Name"
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                        disabled={isProcessing}
                                        className={`w-full px-4 py-3.5 rounded-[var(--radius-xl)] border text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors disabled:opacity-50 shadow-sm ${
                                            isLight
                                                ? "border-slate-200 bg-white text-slate-900"
                                                : "border-white/10 bg-white/5 text-white"
                                        }`}
                                    />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email Address"
                                        value={customerEmail}
                                        onChange={(e) =>
                                            setCustomerEmail(e.target.value)
                                        }
                                        disabled={isProcessing}
                                        className={`w-full px-4 py-3.5 rounded-[var(--radius-xl)] border text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors disabled:opacity-50 shadow-sm ${
                                            isLight
                                                ? "border-slate-200 bg-white text-slate-900"
                                                : "border-white/10 bg-white/5 text-white"
                                        }`}
                                    />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Phone Number"
                                        value={customerPhone}
                                        onChange={(e) =>
                                            setCustomerPhone(e.target.value)
                                        }
                                        disabled={isProcessing}
                                        className={`w-full px-4 py-3.5 rounded-[var(--radius-xl)] border text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors disabled:opacity-50 shadow-sm ${
                                            isLight
                                                ? "border-slate-200 bg-white text-slate-900"
                                                : "border-white/10 bg-white/5 text-white"
                                        }`}
                                    />
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Delivery Address (Street, Area, City, State)"
                                        value={deliveryAddress}
                                        onChange={(e) =>
                                            setDeliveryAddress(e.target.value)
                                        }
                                        disabled={isProcessing}
                                        className={`w-full px-4 py-3.5 rounded-[var(--radius-xl)] border text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors disabled:opacity-50 shadow-sm resize-none ${
                                            isLight
                                                ? "border-slate-200 bg-white text-slate-900"
                                                : "border-white/10 bg-white/5 text-white"
                                        }`}
                                    />
                                </div>

                                {checkoutState === "error" && checkoutError && (
                                    <p
                                        className="text-xs font-semibold text-red-500 bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20"
                                        role="alert"
                                    >
                                        {checkoutError}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-[var(--color-brand)] text-white hover:brightness-105 active:scale-[0.99] transition-all py-4 rounded-[var(--radius-xl)] text-sm font-bold mt-2 shadow-lg shadow-[var(--color-brand)]/20 disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <FaSpinner
                                                className="animate-spin text-white"
                                                size={14}
                                            />
                                            {checkoutState === "initiating" &&
                                                "Preparing order..."}
                                            {checkoutState ===
                                                "awaiting-payment" &&
                                                "Awaiting authorization..."}
                                            {checkoutState === "verifying" &&
                                                "Confirming receipt..."}
                                        </>
                                    ) : (
                                        `Pay ${formatNaira(total)}`
                                    )}
                                </button>

                                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 mt-1">
                                    <FaLock
                                        size={10}
                                        className="text-emerald-500"
                                    />{" "}
                                    Secure transaction architecture by Paystack.
                                </p>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
