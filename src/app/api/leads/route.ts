import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { google } from "googleapis";

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
    area?: string; // coverage checker
    planInterest?: string; // talk to sales
    companySize?: string; // talk to sales
    message?: string; // also used as review text for review-submission
    company?: string; // review-submission (optional)
    rating?: number; // review-submission (1-5)
}

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

    // UPDATED: name + phone now required alongside area + email
    if (
        source === "coverage-checker" &&
        (!b.name || !b.phone || !b.area || !b.email)
    ) {
        return {
            valid: false,
            error: "Name, phone, area, and email are required for coverage check",
        };
    }

    // UPDATED: "business type" replaced with "area" — area now
    // required alongside name, email, and phone
    if (
        (source === "on-arrive-popup" || source === "exit-intent-popup") &&
        (!b.name || !b.phone || !b.email || !b.area)
    ) {
        return {
            valid: false,
            error: "Name, email, phone, and area are required",
        };
    }

    // UPDATED: email (business email) now required alongside
    // name, phone, and company size
    if (
        source === "talk-to-sales" &&
        (!b.name || !b.phone || !b.email || !b.companySize)
    ) {
        return {
            valid: false,
            error: "Name, business email, phone, and company size are required",
        };
    }

    // Review submissions: name, rating (1-5), and story text required.
    // Company is optional.
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
            source: source,
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

// ── Email formatting ─────────────────────────────────────

const sourceLabels: Record<LeadSource, string> = {
    "on-arrive-popup": "Website Popup (On Arrive)",
    "exit-intent-popup": "Website Popup (Exit Intent)",
    "coverage-checker": "Coverage Checker",
    newsletter: "Newsletter Signup",
    "talk-to-sales": "Talk to Sales (Plans Page)",
    "review-submission": "Customer Review Submission",
};

// Badge label shown top-right of the email — gives quick visual
// triage on urgency/type without reading the whole email
const sourceBadges: Record<LeadSource, string> = {
    "on-arrive-popup": "New Lead",
    "exit-intent-popup": "Exit Intent",
    "coverage-checker": "Coverage Check",
    newsletter: "Subscriber",
    "talk-to-sales": "SLA Intent",
    "review-submission": "Review — Pending",
};

const LOGO_URL = "../../../../public/DigitekNetworkLogo.png";

// Renders a star rating as filled/empty star characters for
// plain-HTML email compatibility (no icon fonts/images needed)
function renderStars(rating: number): string {
    const full = "★".repeat(Math.max(0, Math.min(5, rating)));
    const empty = "☆".repeat(5 - Math.max(0, Math.min(5, rating)));
    return `<span style="color: #f5a623; font-size: 16px; letter-spacing: 2px;">${full}</span><span style="color: #d8d8d8; font-size: 16px; letter-spacing: 2px;">${empty}</span>`;
}

function buildEmailHtml(payload: LeadPayload): string {
    const label = sourceLabels[payload.source];
    const badge = sourceBadges[payload.source];

    const timestamp = new Date().toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "full",
        timeStyle: "short",
    });

    const isReview = payload.source === "review-submission";

    // Build the dynamic info rows — pairs are grouped two-per-row
    // to match the card-style layout (40% / 60% columns)
    const fields: [string, string][] = [
        payload.name ? ["Name", payload.name] : null,
        payload.email ? ["Email", payload.email] : null,
        payload.phone ? ["Phone", payload.phone] : null,
        payload.businessType ? ["Business Type", payload.businessType] : null,
        payload.area ? ["Area / LGA", payload.area] : null,
        payload.planInterest ? ["Plan Interest", payload.planInterest] : null,
        payload.companySize ? ["Company Size", payload.companySize] : null,
        isReview && payload.company ? ["Company", payload.company] : null,
        isReview && payload.rating
            ? ["Rating", renderStars(payload.rating)]
            : null,
        // For non-review sources, message is shown as a generic field.
        // For reviews, the message IS the story and is rendered
        // separately below as a full-width blockquote, not in this grid.
        !isReview && payload.message ? ["Message", payload.message] : null,
        ["Source", label],
        ["Submitted", timestamp],
    ].filter(Boolean) as [string, string][];

    // Render two fields per row (40% / 60% split), matching the
    // reference template's "Company Name | Corporate Email" layout
    const rowsHtml: string[] = [];
    for (let i = 0; i < fields.length; i += 2) {
        const [leftKey, leftVal] = fields[i];
        const right = fields[i + 1];
        const isLast = i + 2 >= fields.length;
        const borderStyle = isLast ? "" : "border-bottom: 1px solid #eeeeee;";

        rowsHtml.push(`
      <tr>
        <td style="padding: 12px 0; ${borderStyle} width: 40%;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888888; display: block; margin-bottom: 2px;">${leftKey}</span>
          <strong style="font-size: 13px; font-weight: 700; color: #111111; word-break: break-word;">${leftVal}</strong>
        </td>
        ${
            right
                ? `<td style="padding: 12px 0 12px 16px; ${borderStyle} width: 60%;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888888; display: block; margin-bottom: 2px;">${right[0]}</span>
                <strong style="font-size: 13px; font-weight: 600; color: #333333; word-break: break-word;">${right[1]}</strong>
              </td>`
                : `<td style="padding: 12px 0 12px 16px; ${borderStyle} width: 60%;"></td>`
        }
      </tr>
    `);
    }

    // Subtitle copy varies slightly by source for context
    const subtitleMap: Record<LeadSource, string> = {
        "on-arrive-popup":
            "A visitor submitted their details via the on-arrival contact prompt. Review the profile below and follow up.",
        "exit-intent-popup":
            "A visitor requested a free assessment before leaving the site. Review the profile below and follow up.",
        "coverage-checker":
            "A prospective customer is checking service availability in their area. Confirm coverage and respond.",
        newsletter: "A new subscriber has joined the mailing list.",
        "talk-to-sales":
            "A customer profile has initialized infrastructure topology parameters. Review submission routing profiles below.",
        "review-submission":
            "A customer submitted a review for moderation. It will not appear on the site until added to lib/reviews.ts.",
    };

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 540px; margin: 40px auto; background-color: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-top: 3px solid #A30005;">

        <!-- Header -->
        <div style="padding: 32px 32px 24px 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0; vertical-align: middle;">
                <img src="${LOGO_URL}" alt="Digitek Network" width="125" height="auto" style="display: block; border: 0; outline: none; text-decoration: none;" />
              </td>
              <td style="padding: 0; text-align: right; vertical-align: middle;">
                <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #666666; background-color: #f5f5f5; border: 1px solid #e5e5e5; padding: 4px 8px; border-radius: 4px;">
                  ${badge}
                </span>
              </td>
            </tr>
          </table>

          <h1 style="margin: 28px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #111111; line-height: 1.2;">
            ${isReview ? "New Review Submission" : `New Lead: ${label}`}
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 400; color: #666666; line-height: 1.5;">
            ${subtitleMap[payload.source]}
          </p>
        </div>

        <!-- Info card -->
        <div style="padding: 0 32px 32px 32px;">
          <div style="background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 6px; padding: 20px; margin-top: 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              ${rowsHtml.join("")}
            </table>
          </div>

          ${
              isReview && payload.message
                  ? `<div style="margin-top: 16px; padding: 18px 20px; background-color: #fff9f0; border: 1px solid #f5e6d3; border-radius: 6px;">
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #b8860b; display: block; margin-bottom: 8px;">Their story</span>
                  <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #333333; font-style: italic;">&ldquo;${payload.message}&rdquo;</p>
                </div>`
                  : ""
          }
        </div>

        <!-- Footer -->
        <div style="padding: 20px 32px; background-color: #fdfdfd; border-top: 1px solid #f0f0f0; text-align: left;">
          <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #999999; font-weight: 500;">
            ${
                isReview
                    ? `Automated message from <span style="font-weight: 700; color: #666666;">Digitek Network</span> review pipeline. To publish this review, add it to <span style="font-weight: 700; color: #666666;">lib/reviews.ts</span> and redeploy.`
                    : `Automated message from <span style="font-weight: 700; color: #666666;">Digitek Network</span> lead capture system. Please follow up with this lead within 2 business hours.`
            }
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

function buildEmailSubject(payload: LeadPayload): string {
    const label = sourceLabels[payload.source];
    const identifier =
        payload.name ??
        payload.email ??
        payload.phone ??
        payload.area ??
        "Unknown";

    if (payload.source === "review-submission") {
        const stars = payload.rating ? `${payload.rating}★` : "";
        return `[Review] ${identifier} ${stars}`.trim();
    }

    return `[Lead] ${label} — ${identifier}`;
}

// ── Resend ───────────────────────────────────────────────

async function sendEmail(payload: LeadPayload): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.NOTIFICATION_EMAIL;

    if (!apiKey || !toEmail) {
        console.warn("Resend not configured — skipping email");
        return;
    }

    const resend = new Resend(apiKey);

    // RESEND_FROM_EMAIL not set → use Resend's sandbox sender.
    // Once digitekhub.io is verified, set RESEND_FROM_EMAIL=leads@digitekhub.io
    const fromAddress =
        process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    const result = await resend.emails.send({
        from: `Digitek Leads <${fromAddress}>`,
        to: toEmail,
        subject: buildEmailSubject(payload),
        html: buildEmailHtml(payload),
        ...(payload.email ? { replyTo: payload.email } : {}),
    });

    if (result.error) {
        console.error("Resend error:", result.error);
        throw new Error(result.error.message);
    }
}

// ── Google Sheets ────────────────────────────────────────

async function appendToSheet(payload: LeadPayload): Promise<void> {
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!sheetId || !keyRaw) {
        console.warn("Google Sheets not configured — skipping sheet append");
        return;
    }

    let credentials: {
        client_email: string;
        private_key: string;
    };

    try {
        credentials = JSON.parse(keyRaw);
    } catch {
        console.error(
            "Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY — must be valid JSON",
        );
        return;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const timestamp = new Date().toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "short",
        timeStyle: "short",
    });

    const row = [
        timestamp,
        sourceLabels[payload.source],
        payload.name ?? "",
        payload.email ?? "",
        payload.phone ?? "",
        payload.businessType ?? "",
        payload.area ?? "",
        payload.planInterest ?? "",
        payload.companySize ?? "",
        payload.company ?? "",
        payload.rating != null ? String(payload.rating) : "",
        payload.message ?? "",
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A:L",
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [row],
        },
    });
}

// ── Rate limiting (simple in-memory) ────────────────────

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

        const [emailResult, sheetResult] = await Promise.allSettled([
            sendEmail(payload),
            appendToSheet(payload),
        ]);

        if (emailResult.status === "rejected") {
            console.error("Email send failed:", emailResult.reason);
        }

        if (sheetResult.status === "rejected") {
            console.error("Sheet append failed:", sheetResult.reason);
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
