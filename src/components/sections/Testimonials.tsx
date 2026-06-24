/**
 * components/sections/Testimonials.tsx
 *
 * UPDATED:
 * - Now reads from lib/reviews.ts (REVIEWS) instead of the
 *   hardcoded TESTIMONIALS array in lib/constants.ts. This is
 *   the list the team edits when approving review submissions.
 * - Star rating is now dynamic per review (was hardcoded 5 stars)
 * - role/company are now optional — falls back gracefully
 * - If a review has no imageKey, shows an initials avatar instead
 *   of a photo
 */

"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { Section } from "@/src/components/layout/Section";
import { Container } from "@/src/components/layout/Container";
import { ScrollReveal } from "@/src/components/common/ScrollReveal";
import { REVIEWS } from "@/src/lib/reviews";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/src/components/ui/carousel";

const imageMap: Record<string, string> = {
    image1: "/image3.jpeg",
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function Testimonials() {
    const autoplay = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true }),
    );

    return (
        <Section variant="brand">
            <Container size="lg">
                <ScrollReveal>
                    <div className="text-center mb-12">
                        <span className="text-eyebrow text-white/40">
                            Client Stories
                        </span>
                        <h2 className="text-h2 text-white mt-3">
                            What Our Clients Say
                        </h2>
                    </div>
                </ScrollReveal>

                <Carousel
                    opts={{ align: "start", loop: true }}
                    plugins={[autoplay.current]}
                    className="w-full max-w-2xl mx-auto"
                >
                    <CarouselContent>
                        {REVIEWS.map((review, index) => (
                            <CarouselItem key={index} className="px-3">
                                <div
                                    className="relative rounded-[var(--radius-xl)] p-8 overflow-hidden
                               bg-white/5 border border-white/10 backdrop-blur-sm"
                                >
                                    <span
                                        className="absolute top-4 right-6 text-[120px] leading-none
                               text-white/5 font-serif select-none pointer-events-none"
                                        aria-hidden="true"
                                    >
                                        &ldquo;
                                    </span>
                                    <div className="relative z-10 flex flex-col items-center text-center gap-5">
                                        <div
                                            className="flex items-center gap-1"
                                            aria-label={`${review.rating} out of 5 stars`}
                                        >
                                            {Array.from({ length: 5 }).map(
                                                (_, i) =>
                                                    i < review.rating ? (
                                                        <FaStar
                                                            key={i}
                                                            size={14}
                                                            className="text-yellow-400"
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        <FaRegStar
                                                            key={i}
                                                            size={14}
                                                            className="text-white/20"
                                                            aria-hidden="true"
                                                        />
                                                    ),
                                            )}
                                        </div>
                                        <blockquote>
                                            <p className="text-body-lg text-white/90 italic leading-relaxed">
                                                &ldquo;{review.text}&rdquo;
                                            </p>
                                        </blockquote>
                                        <div className="flex items-center gap-3">
                                            {review.imageKey &&
                                            imageMap[review.imageKey] ? (
                                                <Image
                                                    src={
                                                        imageMap[
                                                            review.imageKey
                                                        ]
                                                    }
                                                    alt={review.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full border-2 border-[var(--color-brand)] object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="w-12 h-12 rounded-full border-2 border-[var(--color-brand)]
                                     bg-white/10 flex items-center justify-center
                                     text-body-sm font-semibold text-white"
                                                    aria-hidden="true"
                                                >
                                                    {getInitials(review.name)}
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <p className="text-body font-semibold text-white">
                                                    {review.name}
                                                </p>
                                                {(review.role ||
                                                    review.company) && (
                                                    <p className="text-body-sm text-white/50">
                                                        {[
                                                            review.role,
                                                            review.company,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious
                        className="hidden sm:flex -left-14 bg-white/10 border-white/20 text-white
                       hover:bg-[var(--color-brand)] hover:border-[var(--color-brand)] transition-colors duration-200"
                    />
                    <CarouselNext
                        className="hidden sm:flex -right-14 bg-white/10 border-white/20 text-white
                       hover:bg-[var(--color-brand)] hover:border-[var(--color-brand)] transition-colors duration-200"
                    />
                </Carousel>
            </Container>
        </Section>
    );
}
