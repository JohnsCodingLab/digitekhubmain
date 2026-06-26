/**
 * app/(marketing)/contact-us/page.tsx
 *
 * Fully refactored for hybrid theme injection paths.
 * Structural channel indicators shift contrast rules correctly.
 */

"use client";

import React from "react";
import Link from "next/link";
import { LuPhoneCall, LuMail, LuMessageCircle } from "react-icons/lu";
import { FaXTwitter, FaInstagram, FaTiktok } from "react-icons/fa6";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { useTheme } from "@/src/components/common/useTheme";
import {
    CONTACT_CHANNELS,
    SOCIAL_LINKS,
    CONTACT_INFO,
    type ContactChannel,
} from "@/src/lib/constants";
import { FaFacebook } from "react-icons/fa";

const channelIconMap: Record<
    string,
    {
        icon: React.ReactNode;
        color: string;
        bgDark: string;
        bgLight: string;
    }
> = {
    phone: {
        icon: <LuPhoneCall size={20} />,
        color: "text-emerald-500",
        bgDark: "bg-emerald-500/10",
        bgLight: "bg-emerald-500/10",
    },
    email: {
        icon: <LuMail size={20} />,
        color: "text-blue-500",
        bgDark: "bg-blue-500/10",
        bgLight: "bg-blue-500/10",
    },
    whatsapp: {
        icon: <LuMessageCircle size={20} />,
        color: "text-green-500",
        bgDark: "bg-green-500/10",
        bgLight: "bg-green-500/10",
    },
};

function ChannelCard({
    channel,
    isLight,
}: {
    channel: ContactChannel;
    isLight: boolean;
}) {
    const meta = channelIconMap[channel.iconKey] ?? channelIconMap.phone;

    return (
        <div
            className={`group relative flex flex-col gap-4 p-6 rounded-lg border transition-all duration-300 hover:-translate-y-0.5 ${
                isLight
                    ? "bg-white border-neutral-200 text-neutral-900 shadow-xs hover:border-[#A30005]/30"
                    : "bg-[var(--color-bg)] border-neutral-900 text-neutral-200 hover:border-[#A30005]/30"
            }`}
        >
            <div
                className={`w-10 h-12 rounded flex items-center justify-center shrink-0 ${isLight ? meta.bgLight : meta.bgDark} ${meta.color}`}
            >
                {meta.icon}
            </div>

            <div className="flex flex-col gap-1.5 flex-1 text-left">
                <h2
                    className={`text-base font-bold tracking-tight ${isLight ? "text-neutral-900" : "text-white"}`}
                >
                    {channel.title}
                </h2>
                <p
                    className={`text-xs md:text-sm leading-relaxed ${isLight ? "text-neutral-500" : "text-neutral-400"}`}
                >
                    {channel.description}
                </p>
            </div>

            <a
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={
                    channel.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                }
                className={`inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider mt-2 group/link ${meta.color}`}
                aria-label={`${channel.title}: ${channel.actionLabel}`}
            >
                <span>{channel.actionLabel}</span>
                <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                >
                    →
                </span>
            </a>
        </div>
    );
}

export default function ContactUs() {
    const { isLight } = useTheme();

    const socialPills = [
        {
            label: "Instagram",
            href: SOCIAL_LINKS.instagram.href,
            icon: <FaInstagram size={14} />,
            textColor: isLight
                ? "text-pink-600 border-neutral-200"
                : "text-pink-400 border-neutral-800",
        },
        {
            label: "TikTok",
            href: SOCIAL_LINKS.tiktok.href,
            icon: <FaTiktok size={14} />,
            textColor: isLight
                ? "text-neutral-900 border-neutral-200"
                : "text-white border-neutral-800",
        },
        {
            label: "Twitter",
            href: SOCIAL_LINKS.twitter.href,
            icon: <FaXTwitter size={14} />,
            textColor: isLight
                ? "text-neutral-700 border-neutral-200"
                : "text-white/70 border-neutral-800",
        },
        {
            label: "Facebook",
            href: SOCIAL_LINKS.facebook.href,
            icon: <FaFacebook size={14} />,
            textColor: isLight
                ? "text-blue-600 border-neutral-200"
                : "text-blue-500/70 border-neutral-800",
        },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300`}>
            <div style={{ marginTop: "var(--navbar-height)" }}>
                <div
                    className={`py-16 md:py-24 border-b-0 ${isLight ? "bg-white" : "bg-[var(--color-bg)]"}`}
                >
                    <Container>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-20 items-start">
                            {/* Left Frame: Headings & Info */}
                            <div className="lg:col-span-2 flex flex-col gap-8 text-left">
                                <ScrollReveal direction="left">
                                    <div className="relative">
                                        <span
                                            className={`text-[11px] font-bold tracking-[0.15em] uppercase block mb-3 ${isLight ? "text-neutral-400" : "text-neutral-500"}`}
                                        >
                                            Contact Us
                                        </span>
                                        <h1
                                            className={`text-4xl font-black tracking-tight mb-4 ${isLight ? "text-neutral-900" : "text-white"}`}
                                        >
                                            Get In Touch
                                        </h1>
                                        <p
                                            className={`text-sm md:text-base leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-400"}`}
                                        >
                                            Our engineering team is active
                                            around the clock. Whether you
                                            require custom topology mapping,
                                            corporate installation scheduling,
                                            or operational diagnostics support,
                                            we are here.
                                        </p>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal direction="left" delay={0.1}>
                                    <div
                                        className={`flex flex-col gap-4 p-6 rounded-lg border ${isLight ? "bg-white border-neutral-200" : "bg-neutral-950 border-neutral-900"}`}
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                            Direct Nodes
                                        </p>

                                        <a
                                            href={CONTACT_INFO.phone.href}
                                            className={`flex items-center gap-3 transition-colors ${isLight ? "text-neutral-700 hover:text-black" : "text-neutral-300 hover:text-white"}`}
                                        >
                                            <span
                                                className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"
                                                aria-hidden="true"
                                            >
                                                <LuPhoneCall size={14} />
                                            </span>
                                            <span className="text-sm font-semibold">
                                                {CONTACT_INFO.phone.display}
                                            </span>
                                        </a>

                                        <a
                                            href={CONTACT_INFO.email.href}
                                            className={`flex items-center gap-3 transition-colors ${isLight ? "text-neutral-700 hover:text-black" : "text-neutral-300 hover:text-white"}`}
                                        >
                                            <span
                                                className="w-7 h-7 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"
                                                aria-hidden="true"
                                            >
                                                <LuMail size={14} />
                                            </span>
                                            <span className="text-sm font-semibold">
                                                {CONTACT_INFO.email.display}
                                            </span>
                                        </a>

                                        <div className="flex items-start gap-3 text-neutral-500">
                                            <span
                                                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 ${isLight ? "bg-neutral-100 text-neutral-400" : "bg-neutral-900 text-neutral-600"}`}
                                                aria-hidden="true"
                                            >
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle
                                                        cx="12"
                                                        cy="10"
                                                        r="3"
                                                    />
                                                </svg>
                                            </span>
                                            <span className="text-xs md:text-sm leading-relaxed font-medium">
                                                {CONTACT_INFO.address}
                                            </span>
                                        </div>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal direction="left" delay={0.2}>
                                    <div className="flex flex-col gap-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                            Follow Channels
                                        </p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {socialPills.map((social) => (
                                                <Link
                                                    key={social.label}
                                                    href={social.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-2 px-3.5 py-2 border rounded text-xs font-semibold uppercase tracking-wider bg-transparent transition-all hover:scale-[1.01] ${social.textColor}`}
                                                >
                                                    {social.icon}
                                                    <span>{social.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>

                            {/* Right Frame: Channels Grid */}
                            <div className="lg:col-span-3">
                                <ScrollReveal direction="right">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {CONTACT_CHANNELS.map(
                                            (channel, index) => (
                                                <ScrollReveal
                                                    key={channel.id}
                                                    delay={index * 0.05}
                                                >
                                                    <ChannelCard
                                                        channel={channel}
                                                        isLight={isLight}
                                                    />
                                                </ScrollReveal>
                                            ),
                                        )}
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={0.25}>
                                    <div
                                        className={`mt-6 flex items-center gap-3.5 px-5 py-4 rounded border ${
                                            isLight
                                                ? "bg-[#A30005]/[0.02] border-[#A30005]/20"
                                                : "bg-[#A30005]/5 border-[#A30005]/20"
                                        }`}
                                    >
                                        <span
                                            className="w-1.5 h-1.5 rounded-full bg-[#A30005] animate-pulse shrink-0"
                                            aria-hidden="true"
                                        />
                                        <p
                                            className={`text-xs md:text-sm font-medium ${isLight ? "text-neutral-600" : "text-neutral-400"}`}
                                        >
                                            Average response queue:{" "}
                                            <span
                                                className={
                                                    isLight
                                                        ? "text-neutral-900 font-bold"
                                                        : "text-white font-bold"
                                                }
                                            >
                                                under 20 Minutes
                                            </span>
                                            . WhatsApp remains optimized for
                                            urgent critical path resolution
                                            loops.
                                        </p>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
}
