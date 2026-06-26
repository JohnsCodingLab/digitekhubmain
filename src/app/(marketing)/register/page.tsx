/**
 * src/app/(marketing)/register/page.tsx
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/src/components/common/useTheme";
import {
    FaUser,
    FaAddressCard,
    FaWifi,
    FaCalendarDays,
    FaFileExport,
    FaCheck,
    FaSpinner,
    FaTriangleExclamation,
} from "react-icons/fa6";

const INTERNET_PLANS = [
    { tier: "Essential", name: "Fiber Essential", speed: "30" },
    { tier: "Plus", name: "Fiber Plus", speed: "50" },
    { tier: "Pro", name: "Fiber Pro", speed: "60" },
    { tier: "Max", name: "Fiber Max", speed: "75" },
    { tier: "Ultra", name: "Fiber Ultra", speed: "100" },
];

export default function RegisterPage() {
    const { isLight } = useTheme();

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
        address: "",
        gender: "",
        dob: "",
        idType: "",
        idNumber: "",
        plan: "",
        apptDate: "",
        apptTime: "",
        agree: "",
    });

    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [errorVisible, setErrorVisible] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (validationError) setValidationError(null);
    };

    const handleCustomSelect = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (validationError) setValidationError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.gender)
            return setValidationError("Please select your gender.");
        if (!formData.plan)
            return setValidationError("Please select an internet plan.");
        if (!formData.agree)
            return setValidationError(
                "Please indicate if you agree to the terms.",
            );
        if (formData.agree === "no") {
            return setValidationError(
                "You must accept the terms and conditions to submit registration.",
            );
        }

        setLoading(true);
        setErrorVisible(false);
        setValidationError(null);

        const payload = {
            full_name: formData.fullname,
            email: formData.email,
            phone_number: formData.phone,
            address: formData.address,
            gender: formData.gender,
            date_of_birth: formData.dob,
            identity_type: formData.idType,
            identity_number: formData.idNumber,
            internet_plan: formData.plan,
            appointment_date: formData.apptDate,
            appointment_time: formData.apptTime,
            agreed_to_terms: "Yes",
            submitted_at: new Date().toISOString(),
        };

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Registration failed.");
            }

            setIsSuccess(true);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (error) {
            console.error(error);
            setErrorVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            fullname: "",
            email: "",
            phone: "",
            address: "",
            gender: "",
            dob: "",
            idType: "",
            idNumber: "",
            plan: "",
            apptDate: "",
            apptTime: "",
            agree: "",
        });
        setIsSuccess(false);
        setValidationError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Structural CSS mapping matching the design primitives
    const cardBg = isLight
        ? "bg-white border-slate-100 shadow-slate-200/50"
        : "bg-white/5 border-white/10 shadow-2xl";
    const textMain = isLight ? "text-slate-900" : "text-white";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";

    // Inverts native picker icons under dark mode configurations via a clean arbitrary class string
    const inputStyle = `w-full px-4 py-3 rounded-[var(--radius-xl)] border text-sm focus:outline-none focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand)]/[0.06] transition-all duration-300 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
        isLight
            ? "border-slate-200 bg-white text-slate-900 [&::-webkit-calendar-picker-indicator]:filter-none"
            : "border-white/10 bg-black text-white [&::-webkit-calendar-picker-indicator]:invert"
    }`;

    return (
        <div className="max-w-[2000px] mx-auto overflow-x-hidden">
            <div
                className={`min-h-screen pb-20 pt-24 transition-colors duration-300 ${isLight ? "bg-slate-50/50" : "bg-[var(--color-bg)]"}`}
            >
                {/* Header Module */}
                <div className="relative py-12 px-4 text-center overflow-hidden max-w-3xl mx-auto">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none repeating-linear-lines"></div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-3xl sm:text-4xl font-extrabold tracking-tight relative z-10 ${textMain}`}
                    >
                        Internet Registration Form
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`mt-3 text-sm max-w-md mx-auto relative z-10 leading-relaxed ${textMuted}`}
                    >
                        Fill out the configuration profiles below to schedule
                        your high-speed fiber terminal deployment.
                    </motion.p>
                </div>

                <div className="max-w-2xl mx-auto px-4">
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {/* Personal Information Module */}
                                <div
                                    className={`border rounded-[var(--radius-2xl)] p-6 sm:p-8 backdrop-blur-md transition-all duration-300 ${cardBg}`}
                                >
                                    <div className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest border-b pb-3 mb-6 flex items-center gap-2.5 border-dashed border-slate-200 dark:border-white/10">
                                        <FaUser size={14} /> Personal
                                        Information
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                            >
                                                Full Name{" "}
                                                <span className="text-[var(--color-brand)]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullname"
                                                required
                                                value={formData.fullname}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                className={inputStyle}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                                >
                                                    Email Address{" "}
                                                    <span className="text-[var(--color-brand)]">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="johndoe@example.com"
                                                    className={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                                >
                                                    Phone Number{" "}
                                                    <span className="text-[var(--color-brand)]">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+234 800 000 0000"
                                                    className={inputStyle}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                            >
                                                Home Address{" "}
                                                <span className="text-[var(--color-brand)]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Street Number, City, State"
                                                className={inputStyle}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                            >
                                                Gender{" "}
                                                <span className="text-[var(--color-brand)]">
                                                    *
                                                </span>
                                            </label>
                                            <div className="flex flex-wrap gap-2.5 mt-1">
                                                {[
                                                    "Male",
                                                    "Female",
                                                    "Prefer not to say",
                                                ].map((g) => {
                                                    const isSelected =
                                                        formData.gender === g;
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={g}
                                                            onClick={() =>
                                                                handleCustomSelect(
                                                                    "gender",
                                                                    g,
                                                                )
                                                            }
                                                            className={`flex items-center gap-2.5 px-4 py-2.5 border rounded-full text-xs sm:text-sm transition-all duration-300 ${
                                                                isSelected
                                                                    ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.04] text-[var(--color-brand)] font-semibold"
                                                                    : isLight
                                                                      ? "border-slate-200 text-slate-600 bg-white hover:border-[var(--color-brand)]"
                                                                      : "border-white/10 text-slate-300 bg-white/5 hover:border-[var(--color-brand)]"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center transition-all ${
                                                                    isSelected
                                                                        ? "border-[var(--color-brand)]"
                                                                        : "border-slate-300 dark:border-white/20"
                                                                }`}
                                                            >
                                                                {isSelected && (
                                                                    <div className="w-1.5 h-1.5 bg-[var(--color-brand)] rounded-full" />
                                                                )}
                                                            </div>
                                                            {g}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                            >
                                                Date of Birth{" "}
                                                <span className="text-[var(--color-brand)]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="date"
                                                name="dob"
                                                required
                                                value={formData.dob}
                                                onChange={handleInputChange}
                                                className={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Identity Verification Module */}
                                <div
                                    className={`border rounded-[var(--radius-2xl)] p-6 sm:p-8 backdrop-blur-md transition-all duration-300 ${cardBg}`}
                                >
                                    <div className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest border-b pb-3 mb-6 flex items-center gap-2.5 border-dashed border-slate-200 dark:border-white/10">
                                        <FaAddressCard size={14} /> Identity
                                        Verification
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                            >
                                                Identity Type{" "}
                                                <span className="text-[var(--color-brand)]">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="idType"
                                                    required
                                                    value={formData.idType}
                                                    onChange={handleInputChange}
                                                    className={`${inputStyle} appearance-none pr-10`}
                                                >
                                                    <option value="">
                                                        Select ID type
                                                    </option>
                                                    <option value="National ID">
                                                        National ID
                                                    </option>
                                                    <option value="Passport">
                                                        Passport
                                                    </option>
                                                    <option value="Driver's License">
                                                        Driver&apos;s License
                                                    </option>
                                                    <option value="Others">
                                                        Others
                                                    </option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-400"></div>
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                            >
                                                Identity Number{" "}
                                                <span className="text-[var(--color-brand)]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="idNumber"
                                                required
                                                value={formData.idNumber}
                                                onChange={handleInputChange}
                                                placeholder="A00000000"
                                                className={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Internet Plan Selection Grid */}
                                <div
                                    className={`border rounded-[var(--radius-2xl)] p-6 sm:p-8 backdrop-blur-md transition-all duration-300 ${cardBg}`}
                                >
                                    <div className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest border-b pb-3 mb-6 flex items-center gap-2.5 border-dashed border-slate-200 dark:border-white/10">
                                        <FaWifi size={14} /> Select Internet
                                        Plan
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {INTERNET_PLANS.map((p) => {
                                            const fullPlanValue = `${p.name} ${p.speed}Mbps`;
                                            const isSelected =
                                                formData.plan === fullPlanValue;
                                            return (
                                                <button
                                                    type="button"
                                                    key={p.speed}
                                                    onClick={() =>
                                                        handleCustomSelect(
                                                            "plan",
                                                            fullPlanValue,
                                                        )
                                                    }
                                                    className={`border rounded-[var(--radius-xl)] p-4 text-center transition-all duration-300 relative overflow-hidden outline-none group ${
                                                        isSelected
                                                            ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.04] shadow-sm scale-[1.02]"
                                                            : isLight
                                                              ? "border-slate-100 bg-slate-50/50 hover:border-[var(--color-brand)] hover:bg-white"
                                                              : "border-white/5 bg-white/[0.02] hover:border-[var(--color-brand)] hover:bg-white/5"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <span className="absolute top-2 right-2.5 text-[10px] font-bold text-[var(--color-brand)]">
                                                            ✓
                                                        </span>
                                                    )}
                                                    <div className="text-[9px] font-bold text-[var(--color-brand)] uppercase tracking-wider mb-0.5 opacity-80">
                                                        {p.tier}
                                                    </div>
                                                    <div
                                                        className={`text-xs font-bold mb-2 transition-colors duration-300 ${textMain}`}
                                                    >
                                                        {p.name}
                                                    </div>
                                                    <div className="text-3xl font-black text-[var(--color-brand)] tracking-tight">
                                                        {p.speed}
                                                    </div>
                                                    <div
                                                        className={`text-[10px] font-medium mt-0.5 ${textMuted}`}
                                                    >
                                                        Mbps
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Appointment Framework Module */}
                                <div
                                    className={`border rounded-[var(--radius-2xl)] p-6 sm:p-8 backdrop-blur-md transition-all duration-300 ${cardBg}`}
                                >
                                    <div className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest border-b pb-3 mb-6 flex items-center gap-2.5 border-dashed border-slate-200 dark:border-white/10">
                                        <FaCalendarDays size={14} /> Appointment
                                        Details
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                            >
                                                Appointment Date{" "}
                                                <span className="text-[var(--color-brand)]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="date"
                                                name="apptDate"
                                                required
                                                value={formData.apptDate}
                                                onChange={handleInputChange}
                                                className={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${textMain}`}
                                            >
                                                Appointment Time{" "}
                                                <span className="text-[var(--color-brand)]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="time"
                                                name="apptTime"
                                                required
                                                value={formData.apptTime}
                                                onChange={handleInputChange}
                                                className={inputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Legal Agreement Terms Box */}
                                <div
                                    className={`border rounded-[var(--radius-2xl)] p-6 sm:p-8 backdrop-blur-md transition-all duration-300 ${cardBg}`}
                                >
                                    <div className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest border-b pb-3 mb-6 flex items-center gap-2.5 border-dashed border-slate-200 dark:border-white/10">
                                        <FaFileExport size={14} /> Terms &amp;
                                        Conditions
                                    </div>

                                    <div
                                        className={`border rounded-[var(--radius-xl)] p-4 text-xs space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar leading-relaxed ${
                                            isLight
                                                ? "bg-slate-50 border-slate-100 text-slate-600"
                                                : "bg-white/[0.02] border-white/5 text-slate-300"
                                        }`}
                                    >
                                        <p>
                                            <strong className="text-[var(--color-brand)] font-semibold">
                                                12 Month Contract Plan:
                                            </strong>{" "}
                                            Customers who select the 12 Month
                                            Contract Plan will enjoy free
                                            installation upon activation. This
                                            plan requires a minimum commitment
                                            of twelve (12) months, with
                                            subscription fees payable on a
                                            monthly basis throughout the
                                            contract period. During this time,
                                            the Company will provide stable and
                                            unlimited internet service, subject
                                            to network availability and fair
                                            usage standards. Early cancellation
                                            before the completion of the
                                            12-month term may attract device
                                            retrieval.
                                        </p>
                                        <p>
                                            <strong className="text-[var(--color-brand)] font-semibold">
                                                Non-Contract Plan:
                                            </strong>{" "}
                                            Customers who prefer flexibility may
                                            choose the Non-Contract Plan by
                                            paying a one-time installation fee
                                            of ₦85,000. This option does not
                                            require a long-term commitment, and
                                            renewals can be made at the
                                            customer&apos;s discretion. By
                                            clicking &quot;Agree&quot; and
                                            submitting this form, you
                                            acknowledge that you have read,
                                            understood, and accepted the terms
                                            of your selected plan.
                                        </p>
                                    </div>

                                    <div className="mt-6">
                                        <span
                                            className={`block text-[11px] font-bold uppercase tracking-wider mb-3 ${textMain}`}
                                        >
                                            Do you agree to the terms and
                                            conditions?{" "}
                                            <span className="text-[var(--color-brand)]">
                                                *
                                            </span>
                                        </span>
                                        <div className="flex flex-wrap gap-2.5">
                                            {[
                                                {
                                                    value: "yes",
                                                    label: "Yes, I agree",
                                                },
                                                {
                                                    value: "no",
                                                    label: "No, I do not agree",
                                                },
                                            ].map((opt) => {
                                                const isSelected =
                                                    formData.agree ===
                                                    opt.value;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={opt.value}
                                                        onClick={() =>
                                                            handleCustomSelect(
                                                                "agree",
                                                                opt.value,
                                                            )
                                                        }
                                                        className={`flex items-center gap-2.5 px-4 py-2.5 border rounded-full text-xs sm:text-sm transition-all duration-300 ${
                                                            isSelected
                                                                ? "border-[var(--color-brand)] bg-[var(--color-brand)]/[0.04] text-[var(--color-brand)] font-semibold"
                                                                : isLight
                                                                  ? "border-slate-200 text-slate-600 bg-white hover:border-[var(--color-brand)]"
                                                                  : "border-white/10 text-slate-300 bg-white/5 hover:border-[var(--color-brand)]"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center transition-all ${
                                                                isSelected
                                                                    ? "border-[var(--color-brand)]"
                                                                    : "border-slate-300 dark:border-white/20"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <div className="w-1.5 h-1.5 bg-[var(--color-brand)] rounded-full" />
                                                            )}
                                                        </div>
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Error and Form Submission Handler */}
                                <div className="pt-2">
                                    {validationError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-amber-500/10 border border-amber-500/20 rounded-[var(--radius-xl)] p-3.5 text-xs font-semibold text-amber-500 mb-4 flex items-center gap-2"
                                        >
                                            <FaTriangleExclamation size={14} />{" "}
                                            {validationError}
                                        </motion.div>
                                    )}

                                    {errorVisible && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-[var(--radius-xl)] p-3.5 text-xs font-semibold text-red-500 mb-4 flex items-center gap-2">
                                            <FaTriangleExclamation size={14} />{" "}
                                            Something went wrong. Please check
                                            your network connection and try
                                            again.
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-[var(--color-brand)] hover:brightness-105 text-white text-sm font-bold tracking-wider rounded-[var(--radius-xl)] uppercase shadow-lg shadow-[var(--color-brand)]/15 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2.5"
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner
                                                    className="animate-spin text-white"
                                                    size={14}
                                                />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <span>Submit Registration</span>
                                        )}
                                    </button>

                                    <p
                                        className={`text-center text-[10px] mt-3 ${textMuted}`}
                                    >
                                        All parameters designated with{" "}
                                        <span className="text-[var(--color-brand)]">
                                            *
                                        </span>{" "}
                                        are strictly mandatory.
                                    </p>
                                </div>
                            </motion.form>
                        ) : (
                            /* Success Panel View */
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                className={`border rounded-[var(--radius-2xl)] p-8 sm:p-12 text-center shadow-2xl max-w-xl mx-auto backdrop-blur-md ${cardBg}`}
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <FaCheck size={24} />
                                </div>
                                <h2
                                    className={`text-2xl font-black mb-2 tracking-tight ${textMain}`}
                                >
                                    Registration Submitted!
                                </h2>
                                <div className="w-12 h-[3px] bg-[var(--color-brand)] rounded mx-auto my-4"></div>
                                <p
                                    className={`text-sm leading-relaxed max-w-sm mx-auto ${textMuted}`}
                                >
                                    Thank you for registering. We have received
                                    your application and will be in touch
                                    shortly to confirm your appointment and next
                                    steps.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="mt-8 px-6 py-3 border border-[var(--color-brand)] text-[var(--color-brand)] bg-[var(--color-brand)]/[0.02] hover:bg-[var(--color-brand)] hover:text-white text-xs font-bold uppercase tracking-wider rounded-[var(--radius-xl)] transition-all duration-300"
                                >
                                    Submit Another Registration
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
