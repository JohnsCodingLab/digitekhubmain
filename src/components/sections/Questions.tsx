"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { FAQ_DATA } from "@/src/lib/constants";
import { faqAnswerVariants } from "@/src/lib/animations";
import { IoIosArrowDown } from "react-icons/io";

export default function Questions() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <Section variant="light">
            <Container size="md">
                <ScrollReveal>
                    <div className="text-center mb-12">
                        <span className="text-eyebrow">FAQ</span>
                        <h2 className="text-h2 text-black mt-3 mb-4">
                            Got Questions?
                        </h2>
                        {/* Brand line accent */}
                        <span
                            className="brand-line brand-line-lg mx-auto block"
                            aria-hidden="true"
                        />
                    </div>
                </ScrollReveal>

                <div className="flex flex-col" role="list">
                    {FAQ_DATA.map((faq, index) => {
                        const isOpen = openIndex === index;
                        const answerId = `faq-answer-${index}`;
                        const questionId = `faq-question-${index}`;

                        return (
                            <div
                                key={index}
                                role="listitem"
                                className="border-b border-black/8 last:border-none"
                            >
                                <button
                                    id={questionId}
                                    role="button"
                                    aria-expanded={isOpen}
                                    aria-controls={answerId}
                                    onClick={() => toggle(index)}
                                    className="w-full flex items-center justify-between gap-4
                             text-left py-5
                             focus-visible:outline-none
                             focus-visible:ring-2
                             focus-visible:ring-[var(--color-brand)]
                             rounded-[var(--radius-xs)]"
                                >
                                    <span
                                        className={`text-body font-medium transition-colors duration-200 ${
                                            isOpen
                                                ? "text-[var(--color-brand)]"
                                                : "text-black/80 hover:text-black"
                                        }`}
                                    >
                                        {faq.question}
                                    </span>

                                    <motion.span
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`shrink-0 transition-colors duration-200 ${
                                            isOpen
                                                ? "text-[var(--color-brand)]"
                                                : "text-black/40"
                                        }`}
                                        aria-hidden="true"
                                    >
                                        <IoIosArrowDown size={18} />
                                    </motion.span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            id={answerId}
                                            role="region"
                                            aria-labelledby={questionId}
                                            variants={faqAnswerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            className="overflow-hidden"
                                        >
                                            <p className="text-body text-black/55 leading-relaxed pb-5">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </Section>
    );
}
