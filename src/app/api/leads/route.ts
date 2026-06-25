/**
 * app/api/leads/route.ts
 *
 * UPDATED — Resend and Google Sheets removed.
 * All leads are now sent to the n8n webhook which routes
 * to Zepto Mail, Slack, and any other downstream systems
 * the automation specialist configures.
 *
 * One env var required:
 *   N8N_WEBHOOK_URL=https://digitekhub.app.n8n.cloud/webhook/7d768a39-e28e-4c5f-bafa-5aa2a08675ea
 *
 * Payload shape sent to n8n:
 * {
 *   type:        "lead",
 *   source:      string,   // which form
 *   sourceLabel: string,   // human-readable form name
 *   timestamp:   string,   // ISO 8601, Africa/Lagos timezone
 *   name?:       string,
 *   email?:      string,
 *   phone?:      string,
 *   area?:       string,
 *   businessType?: string,
 *   planInterest?: string,
 *   companySize?:  string,
 *   company?:      string,
 *   rating?:       number,
 *   message?:      string,
 * }
 */

import { NextRequest, NextResponse } from "next/server";

// ── Types ────────────────────────────────────────────────

export type LeadSource =
    | "on-arrive-popup"
    | "exit-intent-popup"
    | "coverage-checker"
    | "newsletter"
    | "talk-to-sales"
    | "review-submission";

export interface LeadPayload {
    source: LeadSource;
    name?: string;
    email?: string;
    phone?: string;
    businessType?: string;
    area?: string;
    planInterest?: string;
    companySize?: string;
    message?: string;
    company?: string;
    rating?: number;
}

// ── Source labels ────────────────────────────────────────

const sourceLabels: Record<LeadSource, string> = {
    "on-arrive-popup": "Website Popup (On Arrive)",
    "exit-intent-popup": "Website Popup (Exit Intent)",
    "coverage-checker": "Coverage Checker",
    newsletter: "Newsletter Signup",
    "talk-to-sales": "Talk to Sales (Plans Page)",
    "review-submission": "Customer Review Submission",
};

// ── Validation ───────────────────────────────────────────

function validatePayload(body: unknown): {
    valid: boolean;
    payload?: LeadPayload;
    error?: string;
} {
    if (!body || typeof body !== "object") {
        return { valid: false, error: "Invalid request body" };
    }

    const b = body as Record<string, unknown>;

    const validSources: LeadSource[] = [
        "on-arrive-popup",
        "exit-intent-popup",
        "coverage-checker",
        "newsletter",
        "talk-to-sales",
        "review-submission",
    ];

    if (!b.source || !validSources.includes(b.source as LeadSource)) {
        return { valid: false, error: "Invalid or missing source" };
    }

    const source = b.source as LeadSource;

    if (source === "newsletter" && !b.email) {
        return { valid: false, error: "Email is required for newsletter" };
    }

    if (
        source === "coverage-checker" &&
        (!b.name || !b.phone || !b.area || !b.email)
    ) {
        return {
            valid: false,
            error: "Name, phone, area, and email are required for coverage check",
        };
    }

    if (
        (source === "on-arrive-popup" || source === "exit-intent-popup") &&
        (!b.name || !b.phone || !b.email || !b.area)
    ) {
        return {
            valid: false,
            error: "Name, email, phone, and area are required",
        };
    }

    if (
        source === "talk-to-sales" &&
        (!b.name || !b.phone || !b.email || !b.companySize)
    ) {
        return {
            valid: false,
            error: "Name, business email, phone, and company size are required",
        };
    }

    if (source === "review-submission") {
        const rating =
            typeof b.rating === "number" ? b.rating : Number(b.rating);
        if (!b.name || !b.message) {
            return { valid: false, error: "Name and your story are required" };
        }
        if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return {
                valid: false,
                error: "A star rating between 1 and 5 is required",
            };
        }
    }

    return {
        valid: true,
        payload: {
            source,
            name: typeof b.name === "string" ? b.name.trim() : undefined,
            email: typeof b.email === "string" ? b.email.trim() : undefined,
            phone: typeof b.phone === "string" ? b.phone.trim() : undefined,
            businessType:
                typeof b.businessType === "string"
                    ? b.businessType.trim()
                    : undefined,
            area: typeof b.area === "string" ? b.area.trim() : undefined,
            planInterest:
                typeof b.planInterest === "string"
                    ? b.planInterest.trim()
                    : undefined,
            companySize:
                typeof b.companySize === "string"
                    ? b.companySize.trim()
                    : undefined,
            message:
                typeof b.message === "string" ? b.message.trim() : undefined,
            company:
                typeof b.company === "string" ? b.company.trim() : undefined,
            rating:
                source === "review-submission"
                    ? typeof b.rating === "number"
                        ? b.rating
                        : Number(b.rating)
                    : undefined,
        },
    };
}

// ── Webhook notification ─────────────────────────────────

async function notifyWebhook(payload: LeadPayload): Promise<void> {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("N8N_WEBHOOK_URL not configured — skipping webhook");
        return;
    }

    const timestamp = new Date().toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "full",
        timeStyle: "short",
    });

    // Clean payload — only include fields that have values
    // so n8n receives a tidy object with no undefined/empty keys
    const webhookBody: Record<string, unknown> = {
        type: "lead",
        source: payload.source,
        sourceLabel: sourceLabels[payload.source],
        timestamp,
    };

    if (payload.name) webhookBody.name = payload.name;
    if (payload.email) webhookBody.email = payload.email;
    if (payload.phone) webhookBody.phone = payload.phone;
    if (payload.area) webhookBody.area = payload.area;
    if (payload.businessType) webhookBody.businessType = payload.businessType;
    if (payload.planInterest) webhookBody.planInterest = payload.planInterest;
    if (payload.companySize) webhookBody.companySize = payload.companySize;
    if (payload.company) webhookBody.company = payload.company;
    if (payload.rating) webhookBody.rating = payload.rating;
    if (payload.message) webhookBody.message = payload.message;

    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookBody),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Webhook failed: ${response.status} ${text}`);
    }
}

// ── Rate limiting ────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return false;
    }

    if (record.count >= RATE_LIMIT) return true;
    record.count++;
    return false;
}

// ── Handler ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            request.headers.get("x-real-ip") ??
            "unknown";

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 },
            );
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400 },
            );
        }

        const { valid, payload, error } = validatePayload(body);
        if (!valid || !payload) {
            return NextResponse.json({ error }, { status: 400 });
        }

        try {
            await notifyWebhook(payload);
        } catch (err) {
            // Log but don't fail the request — the lead was valid,
            // the webhook is an external dependency. The user still
            // gets a success response so they don't resubmit.
            console.error("Webhook notification failed:", err);
        }

        return NextResponse.json(
            { success: true, message: "Lead captured successfully" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Lead capture error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function GET() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
