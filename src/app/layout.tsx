import type { Metadata } from "next";
import "./globals.css";
import FloatingSupport from "@/src/components/common/FloatingSupport";
import { ThemeProvider } from "../components/common/ThemeProvider";

export const metadata: Metadata = {
    title: "Digitek Network | Reliable & Affordable Business Internet Provider in Nigeria",
    description:
        "Digitek Network provides fast, secure, and scalable internet solutions for businesses, schools, hotels, startups, and enterprises across Nigeria. Stay connected 24/7 with expert support.",
    keywords: [
        "business internet",
        "broadband Nigeria",
        "Digitek Network",
        "WiFi provider",
        "internet for businesses",
        "corporate network setup",
        "office internet plans",
        "enterprise connectivity",
        "fast WiFi in Lagos",
        "Digitek internet services",
    ],
    authors: [{ name: "DigitekHub" }],
    creator: "DigitekHub",
    publisher: "DigitekHub",
    openGraph: {
        title: "Digitek Network | Nigeria's Reliable Business Internet Provider",
        description:
            "From high-speed business internet to networking and 24/7 support, Digitek Network powers businesses across Nigeria.",
        url: "https://network.digitekhub.io/",
        siteName: "Digitek Network",
        locale: "en_NG",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Digitek Network - Fast & Affordable Business Internet in Nigeria",
        description:
            "Powering businesses with secure, high-speed internet and reliable local networking solutions.",
        creator: "@Digitekhub",
    },
    icons: {
        icon: "/favicon.ico",
    },
    metadataBase: new URL("https://network.digitekhub.io/"),
    other: {
        "Content-Security-Policy":
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://checkout.paystack.com; " +
            "script-src-elem 'self' 'unsafe-inline' blob: https://js.paystack.co https://checkout.paystack.com; " +
            "frame-src 'self' https://js.paystack.co https://checkout.paystack.com;",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                {/* Rubik only — the one font family actually in use */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased">
                {/* Skip to content — keyboard and screen reader users */}
                <ThemeProvider>
                    <a href="#main-content" className="skip-to-content">
                        Skip to main content
                    </a>
                    <main id="main-content">
                        {children}
                        <FloatingSupport />
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}
