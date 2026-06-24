import React from "react";
import { cn } from "@/src/lib/utils";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

interface ContainerProps {
    children: React.ReactNode;
    size?: ContainerSize;
    className?: string;
    as?: React.ElementType;
}

const sizeClasses: Record<ContainerSize, string> = {
    sm: "max-w-3xl", // 768px  — used for FAQ, narrow content
    md: "max-w-4xl", // 896px  — used for contact, centered content
    lg: "max-w-6xl", // 1152px — used for most sections
    xl: "max-w-7xl", // 1280px — used for wide grids (plans, industries)
    full: "max-w-none", // full width — used for hero, full-bleed sections
};

export function Container({
    children,
    size = "xl",
    className,
    as: Tag = "div",
}: ContainerProps) {
    return (
        <Tag
            className={cn(
                "mx-auto w-full container-pad",
                sizeClasses[size],
                className,
            )}
        >
            {children}
        </Tag>
    );
}
