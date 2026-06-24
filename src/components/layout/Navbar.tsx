"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { HiArrowRight } from "react-icons/hi2";
import { NAV_LINKS, SITE_CONFIG } from "@/src/lib/constants";
import { Button } from "@/src/components/common/Button";
import { mobileMenuVariants } from "@/src/lib/animations";
import { ThemeToggle } from "../common/ThemeToggle";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);
    const pathname = usePathname();

    const handleScroll = useCallback(() => {
        if (!ticking.current) {
            ticking.current = true;
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
                    setScrolled(currentScrollY > 60);
                    lastScrollY.current = currentScrollY;
                }
                ticking.current = false;
            });
        }
    }, []);

    useEffect(() => {
        setScrolled(window.scrollY > 60);
        lastScrollY.current = window.scrollY;
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Close menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const toggleMenu = () => setIsOpen((prev) => !prev);
    const closeMenu = () => setIsOpen(false);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <nav
            aria-label="Main navigation"
            className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
            style={
                scrolled && !isOpen
                    ? {
                          background: "rgba(0,0,0,0.55)",
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          borderBottom: "1px solid rgba(255,255,255,0.07)",
                          boxShadow:
                              "0 1px 0 rgba(163,0,5,0.15), 0 8px 32px rgba(0,0,0,0.4)",
                      }
                    : {
                          background: "var(--color-bg)",
                          borderBottom: "1px solid transparent",
                      }
            }
        >
            <div className="mx-auto max-w-7xl px-6 h-[var(--navbar-height)] flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    aria-label="Digitek Network — home"
                    onClick={closeMenu}
                    className="flex-shrink-0"
                >
                    <Image
                        src="/DigitekNetworkLogo.png"
                        alt="Digitek Network"
                        width={135}
                        height={45}
                        priority
                    />
                </Link>

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-1" role="list">
                    {NAV_LINKS.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                role="listitem"
                                target={link.external ? "_blank" : undefined}
                                rel={
                                    link.external
                                        ? "noopener noreferrer"
                                        : undefined
                                }
                                className={[
                                    "relative px-3.5 py-1.5 text-sm font-medium rounded-[var(--radius-sm)]",
                                    "transition-all duration-200",
                                    "hover:bg-white/5",
                                    active
                                        ? "text-white"
                                        : "text-white/55 hover:text-white",
                                ].join(" ")}
                            >
                                {link.label}

                                {/* Active indicator */}
                                {active && (
                                    <span
                                        className="absolute bottom-[-1px] left-3.5 right-3.5 h-[2px] rounded-full"
                                        style={{
                                            background: "var(--color-brand)",
                                            boxShadow:
                                                "0 0 8px var(--color-brand-glow)",
                                        }}
                                    />
                                )}

                                {/* Hover underline for inactive links */}
                                {!active && (
                                    <span className="nav-link-underline-inner absolute bottom-[-1px] left-3.5 right-3.5 h-[2px] rounded-full bg-[var(--color-brand)] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <Button
                        href={SITE_CONFIG.registerUrl}
                        external
                        variant="primary"
                        size="md"
                        aria-label="Get started with Digitek Network"
                        className="group flex items-center gap-2"
                    >
                        Get Started
                        <HiArrowRight
                            size={14}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                    </Button>
                </div>

                {/* Mobile menu toggle */}
                <div className="md:hidden flex items-center gap-3">
                    <ThemeToggle />
                    <button
                        onClick={toggleMenu}
                        className="flex items-center gap-1.5 text-white/70 hover:text-white
                    px-2 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium
                    transition-colors hover:bg-white/8
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[var(--color-brand)]"
                        aria-label={
                            isOpen
                                ? "Close navigation menu"
                                : "Open navigation menu"
                        }
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isOpen ? (
                                <motion.span
                                    key="close"
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <AiOutlineClose size={20} />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="menu"
                                    initial={{ opacity: 0, rotate: 90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <AiOutlineMenu size={20} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {/* <span className="text-xs tracking-wide">
                        {isOpen ? "Close" : "Menu"}
                        </span> */}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="mobile-menu"
                        role="navigation"
                        aria-label="Mobile navigation"
                        variants={mobileMenuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="md:hidden bg-[var(--color-bg-elevated)] border-t border-white/8 overflow-hidden"
                    >
                        <div className="px-4 py-2 flex flex-col">
                            {NAV_LINKS.map((link) => {
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        target={
                                            link.external ? "_blank" : undefined
                                        }
                                        rel={
                                            link.external
                                                ? "noopener noreferrer"
                                                : undefined
                                        }
                                        onClick={closeMenu}
                                        className={[
                                            "flex items-center justify-between",
                                            "py-3.5 px-3 text-sm font-medium",
                                            "border-l-2 rounded-r-[var(--radius-sm)]",
                                            "transition-all duration-150",
                                            active
                                                ? "text-white border-[var(--color-brand)] bg-[var(--color-brand-muted)]"
                                                : "text-white/60 border-transparent hover:text-white hover:border-[var(--color-brand)] hover:bg-white/3",
                                        ].join(" ")}
                                    >
                                        {link.label}
                                        {active && (
                                            <span
                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                style={{
                                                    background:
                                                        "var(--color-brand)",
                                                }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}

                            {/* Mobile CTA */}
                            <div className="pt-4 pb-3 px-1">
                                <Button
                                    href={SITE_CONFIG.registerUrl}
                                    external
                                    variant="primary"
                                    size="md"
                                    className="w-full justify-center gap-2"
                                    aria-label="Get started with Digitek Network"
                                >
                                    Get Started
                                    <HiArrowRight size={14} />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
