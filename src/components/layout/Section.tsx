import React from "react";
import { cn } from "@/src/lib/utils";

type SectionVariant = "dark" | "light" | "light-alt" | "brand" | "transparent";
type SectionSize = "default" | "sm" | "lg" | "none";

interface SectionProps {
    children: React.ReactNode;
    variant?: SectionVariant;
    size?: SectionSize;
    className?: string;
    id?: string;
    as?: React.ElementType;
}

const variantClasses: Record<SectionVariant, string> = {
    dark: "bg-[var(--color-bg)]",
    light: "bg-[var(--color-bg-light)]",
    "light-alt": "bg-[var(--color-bg-light-alt)]",
    brand: "bg-gradient-dark-brand",
    transparent: "bg-transparent",
};

const sizeClasses: Record<SectionSize, string> = {
    default: "section-pad",
    sm: "section-pad-sm",
    lg: "py-32 md:py-40",
    none: "",
};

export function Section({
    children,
    variant = "dark",
    size = "default",
    className,
    id,
    as: Tag = "section",
}: SectionProps) {
    return (
        <Tag
            id={id}
            className={cn(
                "w-full",
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
        >
            {children}
        </Tag>
    );
}
