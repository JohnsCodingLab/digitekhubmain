"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaTiktok, FaInstagram } from "react-icons/fa6";
import {
    NAV_LINKS,
    CONTACT_INFO,
    SOCIAL_LINKS,
    SITE_CONFIG,
} from "@/src/lib/constants";
import { FaTwitter } from "react-icons/fa";

// Social link config
const socialLinks = [
    {
        key: "instagram",
        label: "Instagram",
        href: SOCIAL_LINKS.instagram.href,
        icon: <FaInstagram size={16} />,
    },
    {
        key: "twitter",
        label: "Twitter / X",
        href: SOCIAL_LINKS.twitter.href,
        icon: <FaTwitter size={16} />,
    },
    {
        key: "tiktok",
        label: "TikTok",
        href: SOCIAL_LINKS.tiktok.href,
        icon: <FaTiktok size={16} />,
    },
    {
        key: "facebook",
        label: "Facebook",
        href: SOCIAL_LINKS.facebook.href,
        icon: <FaFacebook size={16} />,
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            aria-label="Site footer"
            className="w-full bg-[var(--color-bg)]"
        >
            {/* Brand-red gradient accent line at top */}
            <div
                className="w-full h-px"
                style={{
                    background:
                        "linear-gradient(to right, transparent, var(--color-brand) 30%, var(--color-brand) 70%, transparent)",
                }}
                aria-hidden="true"
            />

            {/* Main footer content */}
            <div
                className="mx-auto max-w-7xl px-6 py-16
                   grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12"
            >
                {/* Column 1 — Brand */}
                <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-1">
                    <Link href="/" aria-label="Digitek Network — home">
                        <Image
                            src="/DigitekNetworkLogo.png"
                            alt="Digitek Network"
                            width={130}
                            height={44}
                        />
                    </Link>
                    <p className="text-body-sm text-white/40 leading-relaxed max-w-xs">
                        Fast, reliable, and affordable internet solutions for
                        Nigerian businesses and homes. Connected 24/7.
                    </p>
                    <Link
                        href={SITE_CONFIG.registerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium
                       text-[var(--color-brand)] hover:text-[var(--color-brand-light)]
                       transition-colors duration-150 w-fit"
                    >
                        Get Connected →
                    </Link>
                </div>

                {/* Column 2 — Contact */}
                <div className="flex flex-col gap-5">
                    <h3 className="text-label text-white/30">Contact</h3>
                    <ul className="flex flex-col gap-3">
                        <li className="text-body-sm text-white/55 leading-relaxed">
                            {CONTACT_INFO.address}
                        </li>
                        <li>
                            <a
                                href={CONTACT_INFO.email.href}
                                className="text-body-sm text-white/55 hover:text-white
                           transition-colors duration-150"
                            >
                                {CONTACT_INFO.email.display}
                            </a>
                        </li>
                        <li>
                            <a
                                href={CONTACT_INFO.phone.href}
                                className="text-body-sm text-white/55 hover:text-white
                           transition-colors duration-150"
                            >
                                {CONTACT_INFO.networkPhone.display}
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Column 3 — Links */}
                <nav aria-label="Footer navigation">
                    <div className="flex flex-col gap-5">
                        <h3 className="text-label text-white/30">Links</h3>
                        <ul className="flex flex-col gap-3">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        target={
                                            link.external ? "_blank" : undefined
                                        }
                                        rel={
                                            link.external
                                                ? "noopener noreferrer"
                                                : undefined
                                        }
                                        className="text-body-sm text-white/55 hover:text-white
                               transition-colors duration-150"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                {/* Column 4 — Socials */}
                <div className="flex flex-col gap-5">
                    <h3 className="text-label text-white/30">Follow Us</h3>
                    <ul
                        className="flex flex-col gap-2"
                        role="list"
                        aria-label="Social media links"
                    >
                        {socialLinks.map((social) => (
                            <li key={social.key}>
                                <Link
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Digitek Network on ${social.label}`}
                                    className="inline-flex items-center gap-2.5
                             text-body-sm text-white/55 hover:text-white
                             transition-colors duration-150"
                                >
                                    <span
                                        className="text-white/30"
                                        aria-hidden="true"
                                    >
                                        {social.icon}
                                    </span>
                                    {social.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Copyright bar */}
            <div className="border-t border-white/5" role="contentinfo">
                <div
                    className="mx-auto max-w-7xl px-6 py-4
                     flex flex-col sm:flex-row items-center
                     justify-between gap-3"
                >
                    <p className="text-caption text-white/25">
                        © {currentYear} Digitek Network. All rights reserved.
                    </p>
                    <Link
                        href={SITE_CONFIG.officialSiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-caption text-white/25 hover:text-white/50
                       transition-colors duration-150"
                    >
                        digitekhub.io ↗
                    </Link>
                </div>
            </div>
        </footer>
    );
}
