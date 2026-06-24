import React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    href?: string;
    external?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
    "aria-label"?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-[var(--color-brand)] text-white btn-sweep",
    secondary: "bg-white text-black btn-sweep-inverse btn-sweep",
    ghost: "bg-transparent text-white border border-[var(--color-border)] btn-sweep",
    outline:
        "bg-transparent text-[var(--color-brand)] border border-[var(--color-brand)] btn-sweep",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm rounded-[var(--radius-sm)]",
    md: "px-6 py-3 text-sm rounded-[var(--radius-sm)]",
    lg: "px-8 py-4 text-base rounded-[var(--radius-md)]",
};

export function Button({
    children,
    variant = "primary",
    size = "md",
    href,
    external = false,
    onClick,
    disabled = false,
    className,
    type = "button",
    "aria-label": ariaLabel,
}: ButtonProps) {
    const classes = cn(
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 pointer-events-none",
        className,
    );

    // Render as Next.js Link when href is provided
    if (href) {
        return (
            <Link
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={classes}
                aria-label={ariaLabel}
            >
                {children}
            </Link>
        );
    }

    // Render as <button> for interactive elements
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
}
