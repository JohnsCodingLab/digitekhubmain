import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = process.env.N8N_REGISTRATION_WEBHOOK_URL;

export async function POST(req: NextRequest) {
    try {
        if (!WEBHOOK_URL) {
            return NextResponse.json(
                { error: "Webhook URL is not configured." },
                { status: 500 },
            );
        }

        const body = await req.json();

        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const text = await response.text();

            return NextResponse.json(
                {
                    error: "Webhook request failed.",
                    details: text,
                },
                {
                    status: response.status,
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Internal server error.",
            },
            {
                status: 500,
            },
        );
    }
}
