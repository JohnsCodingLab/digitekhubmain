"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaSpinner, FaStar } from "react-icons/fa6";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { useLeadForm, WHAT_TO_EXPECT } from "@/src/lib/leads";

function StarPicker({
    rating,
    onChange,
    disabled,
}: {
    rating: number;
    onChange: (value: number) => void;
    disabled: boolean;
}) {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div
            className="flex items-center gap-1.5"
            role="radiogroup"
            aria-label="Star rating"
        >
            {[1, 2, 3, 4, 5].map((value) => {
                const filled = (hovered ?? rating) >= value;
                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={rating === value}
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        disabled={disabled}
                        onClick={() => onChange(value)}
                        onMouseEnter={() => setHovered(value)}
                        onMouseLeave={() => setHovered(null)}
                        className="p-1 disabled:opacity-50 transition-transform duration-100
                       hover:scale-110 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-[var(--color-brand)]/50 rounded"
                    >
                        <FaStar
                            size={28}
                            className={
                                filled ? "text-yellow-400" : "text-white/15"
                            }
                            aria-hidden="true"
                        />
                    </button>
                );
            })}
        </div>
    );
}

export default function ReviewSubmission() {
    const { state, error, submit } = useLeadForm();

    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [rating, setRating] = useState(0);
    const [story, setStory] = useState("");

    const isSubmitting = state === "submitting";
    const isSuccess = state === "success";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) return; // guarded by required validation below too

        await submit({
            source: "review-submission",
            name,
            ...(company ? { company } : {}),
            rating,
            message: story,
        });
    };

    const expect = WHAT_TO_EXPECT["review-submission"];

    return (
        <Section variant="dark">
            <Container size="md">
                <ScrollReveal>
                    <div className="text-center mb-10">
                        <span className="text-eyebrow">Share Your Story</span>
                        <h2 className="text-h2 text-white mt-3 mb-4">
                            Used Digitek Network? Tell Us About It
                        </h2>
                        <p className="text-body text-white/50 max-w-lg mx-auto">
                            Your experience helps other businesses make the
                            right choice. Submissions are reviewed by our team
                            before being published.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal>
                    <div
                        className="max-w-xl mx-auto p-8 rounded-[var(--radius-xl)]
                       bg-white/5 border border-white/10"
                    >
                        {isSuccess ? (
                            <div className="flex flex-col items-center text-center gap-4 py-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 20,
                                    }}
                                    className="w-14 h-14 rounded-full bg-emerald-400/15 text-emerald-400
                             flex items-center justify-center"
                                >
                                    <FaCheck size={22} />
                                </motion.div>
                                <h3 className="text-h4 text-white">
                                    {expect.heading}
                                </h3>
                                <p className="text-body-sm text-white/50 max-w-sm">
                                    {expect.body}
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-4"
                            >
                                {/* Star rating */}
                                <div className="flex flex-col items-center gap-2 mb-1">
                                    <label className="text-label text-white/50">
                                        Your rating
                                    </label>
                                    <StarPicker
                                        rating={rating}
                                        onChange={setRating}
                                        disabled={isSubmitting}
                                    />
                                    {rating === 0 &&
                                        state === "error" &&
                                        !error && (
                                            <p className="text-caption text-red-400">
                                                Please select a star rating
                                            </p>
                                        )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        aria-label="Your name"
                                        className="w-full px-4 py-3 rounded-[var(--radius-md)]
                               bg-white/5 border border-white/10 text-white
                               placeholder-white/30 text-body-sm
                               focus:outline-none focus:border-[var(--color-brand)]/50
                               disabled:opacity-50 transition-colors duration-150"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Company (optional)"
                                        value={company}
                                        onChange={(e) =>
                                            setCompany(e.target.value)
                                        }
                                        disabled={isSubmitting}
                                        aria-label="Company name (optional)"
                                        className="w-full px-4 py-3 rounded-[var(--radius-md)]
                               bg-white/5 border border-white/10 text-white
                               placeholder-white/30 text-body-sm
                               focus:outline-none focus:border-[var(--color-brand)]/50
                               disabled:opacity-50 transition-colors duration-150"
                                    />
                                </div>

                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Tell us about your experience with Digitek Network..."
                                    value={story}
                                    onChange={(e) => setStory(e.target.value)}
                                    disabled={isSubmitting}
                                    aria-label="Your story"
                                    maxLength={1000}
                                    className="w-full px-4 py-3 rounded-[var(--radius-md)]
                             bg-white/5 border border-white/10 text-white
                             placeholder-white/30 text-body-sm leading-relaxed
                             focus:outline-none focus:border-[var(--color-brand)]/50
                             disabled:opacity-50 transition-colors duration-150
                             resize-none"
                                />
                                <p className="text-caption text-white/30 text-right -mt-2">
                                    {story.length}/1000
                                </p>

                                {state === "error" && error && (
                                    <p
                                        className="text-body-sm text-red-400"
                                        role="alert"
                                    >
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-sweep bg-[var(--color-brand)] text-white
                             px-5 py-3 rounded-[var(--radius-md)]
                             text-sm font-semibold
                             disabled:opacity-60 disabled:pointer-events-none
                             flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner
                                                className="animate-spin"
                                                size={14}
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit My Review"
                                    )}
                                </button>

                                <p className="text-caption text-white/30 text-center">
                                    Reviewed by our team before publishing.
                                    We&apos;ll never share your details with
                                    third parties.
                                </p>
                            </form>
                        )}
                    </div>
                </ScrollReveal>
            </Container>
        </Section>
    );
}
