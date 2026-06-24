"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { FaWhatsapp, FaTimes } from "react-icons/fa";

export default function FloatingSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const whatsappLink = "https://wa.me/message/UVP5FK3ABYYJA1";
    const phoneNumber = "+234 813 936 6884";
    const businessName = "Digitek Network Support";

    // Explicitly typing variants as 'Variants' satisfies the TypeScript compiler
    const bounceVariants: Variants = {
        initial: { y: 0 },
        animate: {
            y: [0, -6, 0, -3, 0],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    const popupVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 15 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 350,
                damping: 28,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 10,
            transition: { duration: 0.15 },
        },
    };

    return (
        <>
            {/* Ambient Backdrop Shading */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 pointer-events-auto"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main Interactive Support Hub Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={popupVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-32 right-6 z-50 w-80 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl shadow-black overflow-hidden font-sans"
                    >
                        {/* Header Matrix Grounded to Official Company Primary Red (#A30005) */}
                        <div className="bg-[#A30005] px-4 py-4 flex items-center justify-between border-b border-[#820004]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-black/20 rounded-lg flex items-center justify-center border border-white/10">
                                    <FaWhatsapp className="text-white text-xl" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-bold text-xs uppercase tracking-wider">
                                        Corporate Support
                                    </h3>
                                    <p className="text-neutral-200 text-[10px] mt-0.5">
                                        Response Time: Immediate
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-neutral-300 hover:text-white hover:bg-white/10 rounded-md p-1.5 transition-colors border border-transparent hover:border-white/5"
                                aria-label="Close support modal"
                            >
                                <FaTimes className="text-sm" />
                            </button>
                        </div>

                        {/* Internal Communication Simulation Space */}
                        <div className="p-4 bg-neutral-900/40">
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-neutral-900 border border-neutral-800 rounded-lg rounded-tl-none p-3.5 shadow-sm mb-4 text-left"
                            >
                                <p className="text-neutral-200 text-xs leading-relaxed">
                                    Hello. Welcome to Digitek Network support.
                                    Let us know how we can assist with your
                                    enterprise infrastructure operations today.
                                </p>
                                <div className="text-[9px] text-neutral-500 font-medium text-right mt-2">
                                    Just now
                                </div>
                            </motion.div>

                            {/* Verification Onboarding Card Link */}
                            <motion.a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="block bg-neutral-900 hover:bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 rounded-lg p-3.5 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#A30005]/10 border border-[#A30005]/20 group-hover:border-[#A30005]/40 rounded-lg flex items-center justify-center text-[#A30005] transition-colors">
                                        <FaWhatsapp className="text-lg" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="text-neutral-200 font-bold text-xs">
                                            {businessName}
                                        </h4>
                                        <p className="text-neutral-500 text-[10.5px] mt-0.5">
                                            {phoneNumber}
                                        </p>
                                    </div>
                                </div>
                            </motion.a>
                        </div>

                        {/* Bottom Compliance Track */}
                        <div className="bg-neutral-950 border-t border-neutral-900 px-4 py-2.5 text-center">
                            <p className="text-[10px] font-medium tracking-wide text-neutral-600 uppercase">
                                Powered By{" "}
                                <span className="text-neutral-400 font-bold">
                                    Digitek.io
                                </span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Interactive Assistance Indicator Text Pill */}
            {!isOpen && (
                <motion.div
                    variants={bounceVariants}
                    initial="initial"
                    animate="animate"
                    className="fixed bottom-14 right-20 z-50 hidden sm:block bg-neutral-950 border border-neutral-800 px-3.5 py-2 rounded-lg shadow-xl cursor-pointer"
                    onClick={() => setIsOpen(true)}
                >
                    <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider whitespace-nowrap">
                        Network Support Live
                    </p>
                </motion.div>
            )}

            {/* Core Support Trigger Action Node */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                variants={bounceVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="fixed bottom-12 right-6 z-50 bg-[#A30005] hover:bg-[#820004] text-white rounded-lg p-3.5 border border-white/10 shadow-2xl transition-colors"
                aria-label="Toggle live network support portal"
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <FaTimes className="h-5 w-5" />
                ) : (
                    <FaWhatsapp className="h-5 w-5" />
                )}
            </motion.button>
        </>
    );
}
