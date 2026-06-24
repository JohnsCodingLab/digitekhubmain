// ─────────────────────────────────────────────
// SITE CONFIGURATION
// ─────────────────────────────────────────────

export const SITE_CONFIG = {
    name: "Digitek Network",
    tagline:
        "Powering Businesses with Fast, Reliable & Affordable Internet Solutions",
    description:
        "From high-speed business internet to local networking and round-the-clock maintenance, Digitekhub ensures your business stays connected and productive.",
    baseUrl: "https://network.digitekhub.io",
    officialSiteUrl: "https://www.digitekhub.io",
    registerUrl: "https://digiteknetwork.netlify.app/",
} as const;

// ─────────────────────────────────────────────
// CONTACT INFORMATION
// Canonical source — was duplicated with inconsistent
// casing (Hello@ vs hello@) across Footer + Contact page
// ─────────────────────────────────────────────

export const CONTACT_INFO = {
    networkPhone: {
        display: "+234 701 908 2131",
        href: "tel:+2347019082131",
    },
    phone: {
        display: "+234 808 444 2133",
        href: "tel:+2348084442133",
    },
    email: {
        display: "network@digitekhub.io",
        href: "mailto:network@digitekhub.io",
    },
    whatsapp: {
        display: "Drop a Message",
        href: "https://wa.me/2348084442133",
    },
    address: "22 Glovo Road Ikoyi, Lagos",
} as const;

// ─────────────────────────────────────────────
// SOCIAL LINKS
// Note: Facebook URL was "#" (missing) — flagged below
// Contact page social links pointed to "/" — fixed here
// ─────────────────────────────────────────────

export const SOCIAL_LINKS = {
    facebook: {
        href: "https://www.facebook.com/profile.php?id=61579287958396",
        label: "Facebook",
    },
    linkedin: {
        href: "http://linkedin.com/company/digitekio/",
        label: "LinkedIn",
    },
    tiktok: {
        href: "https://www.tiktok.com/@digitek_network",
        label: "TikTok",
    },
    instagram: {
        href: "https://www.instagram.com/digitek_network/",
        label: "Instagram",
    },
    twitter: {
        href: "#", // TODO: Add real Twitter/X URL
        label: "Twitter / X",
    },
} as const;

// ─────────────────────────────────────────────
// NAVIGATION
// Was independently hardcoded in Navbar AND Footer
// ─────────────────────────────────────────────

export type NavLink = {
    label: string;
    href: string;
    external?: boolean;
};

export const NAV_LINKS: NavLink[] = [
    { label: "Our Plans", href: "/our-plans" },
    { label: "Shop", href: "/shop" },
    { label: "Contact Us", href: "/contact-us" },
    {
        label: "Official Website",
        href: SITE_CONFIG.officialSiteUrl,
        external: true,
    },
];

// ─────────────────────────────────────────────
// COMPANY STATS
// Was hardcoded as plain text strings in Offer.tsx
// Now typed and ready for animated counters
// ─────────────────────────────────────────────

export type Stat = {
    value: string;
    numericValue?: number; // for counter animation
    suffix?: string;
    label: string;
    sublabel: string;
};

export const COMPANY_STATS: Stat[] = [
    {
        value: "500+",
        numericValue: 500,
        suffix: "+",
        label: "Nigeria's #1 Internet Provider",
        sublabel: "Serving 500+ customers nationwide",
    },
    {
        value: "24/7",
        label: "Support Guarantee",
        sublabel: "Internet Maintenance & Support",
    },
    {
        value: "99.9%",
        numericValue: 99.9,
        suffix: "%",
        label: "Uptime Guarantee",
        sublabel: "Your internet stays connected always",
    },
];

// ─────────────────────────────────────────────
// WHY CHOOSE US
// Was hardcoded as JSX strings in WhyChoose.tsx
// ─────────────────────────────────────────────

export const WHY_CHOOSE_POINTS: string[] = [
    "End-to-end business connectivity (Internet + Networking + Maintenance)",
    "Affordable, scalable solutions",
    "Expert engineers with hands-on experience",
    "99.9% uptime guarantee",
    "24/7 business-focused support",
];

// ─────────────────────────────────────────────
// SOLUTIONS (Services)
// Was hardcoded inline in Solutions.tsx
// Images still referenced locally — paths preserved
// ─────────────────────────────────────────────

export type Solution = {
    title: string;
    imageKey: string; // references image import key in component
    description: string;
};

export const SOLUTIONS: Solution[] = [
    {
        title: "Business Internet Plans",
        imageKey: "internetPlans",
        description:
            "Dedicated fiber connections built for business-grade reliability.",
    },
    {
        title: "Local Networking",
        imageKey: "localNetwork",
        description:
            "LAN/WLAN design, cabling, and router setup handled end-to-end.",
    },
    {
        title: "Internet Maintenance",
        imageKey: "maintenance",
        description:
            "Proactive monitoring and rapid-response support around the clock.",
    },
    {
        title: "Digital Services",
        imageKey: "digital",
        description:
            "Supplementary digital tools to keep your business running smoothly.",
    },
];

// ─────────────────────────────────────────────
// INDUSTRIES
// Was a large inline array in Industries.tsx
// External link repeated 6 times — now references constant
// ─────────────────────────────────────────────

export type Industry = {
    title: string;
    description: string;
    imageKey: string;
    ctaLabel: string;
    href: string;
};

export const INDUSTRIES: Industry[] = [
    {
        title: "SMEs & Startups",
        description:
            "Scalable internet solutions designed to help small businesses and startups grow without limits — reliable, affordable, and built for agility.",
        imageKey: "startup",
        ctaLabel: "Get Connected",
        href: SITE_CONFIG.registerUrl,
    },
    {
        title: "Hospitality",
        description:
            "Seamless connectivity for guests and staff, ensuring smooth operations, online bookings, and superior customer experiences.",
        imageKey: "hotel",
        ctaLabel: "Get Connected",
        href: SITE_CONFIG.registerUrl,
    },
    {
        title: "Education",
        description:
            "High-speed, secure internet and network infrastructure that powers digital learning, research, and collaboration for institutions of all sizes.",
        imageKey: "education",
        ctaLabel: "Get Connected",
        href: SITE_CONFIG.registerUrl,
    },
    {
        title: "Financial Services",
        description:
            "Enterprise-grade connectivity with top-level security and uptime, keeping transactions, client communications, and operations running 24/7.",
        imageKey: "bank",
        ctaLabel: "Get Connected",
        href: SITE_CONFIG.registerUrl,
    },
    {
        title: "Retail & E-commerce",
        description:
            "Fast, dependable internet and networking that supports inventory systems, online stores, payment processing, and customer engagement.",
        imageKey: "mall",
        ctaLabel: "Get Connected",
        href: SITE_CONFIG.registerUrl,
    },
    {
        title: "Corporate Offices",
        description:
            "Robust business internet and local networking designed to maximize productivity, enable remote collaboration, and keep teams connected.",
        imageKey: "conference",
        ctaLabel: "Get Connected",
        href: SITE_CONFIG.registerUrl,
    },
];

// ─────────────────────────────────────────────
// TESTIMONIALS
// Was hardcoded in Testimonials.tsx
// NOTE: All three used the same image — preserved but flagged
// ─────────────────────────────────────────────

export type Testimonial = {
    name: string;
    role: string;
    company: string;
    text: string;
    imageKey: string; // TODO: Replace all with unique real photos
};

export const TESTIMONIALS: Testimonial[] = [
    {
        name: "Michael Olamide",
        // Fixed: was "Micheal" (misspelled)
        role: "CEO",
        company: "Startup Inc.",
        text: "This service transformed our business. Reliable and affordable!",
        imageKey: "image1",
    },
    {
        name: "Richard Lawson",
        role: "CTO",
        company: "Tech Corp",
        text: "The best internet solutions we've used. Scalable and smooth.",
        imageKey: "image1", // TODO: Replace with unique image
    },
    {
        name: "Sarah Johnson",
        role: "Founder",
        company: "Creative Studio",
        text: "I love how easy it was to get started. Highly recommend!",
        imageKey: "image1", // TODO: Replace with unique image
    },
];

// ─────────────────────────────────────────────
// FAQ DATA
// Was hardcoded inline in Questions.tsx
// ─────────────────────────────────────────────

export type FAQ = {
    question: string;
    answer: string;
};

export const FAQ_DATA: FAQ[] = [
    {
        question:
            "How do I know if Digitekhub business internet services are available in my area?",
        answer: "Simply contact us with your business address, and our team will confirm coverage and recommend the best connectivity options for your location.",
    },
    {
        question:
            "What payment methods do you accept for new installations and monthly subscriptions?",
        answer: "We accept bank transfers, corporate debit/credit cards, and flexible business invoicing options for approved customers.",
    },
    {
        question: "How do I relocate my service to a new office or branch?",
        answer: "Contact our support team with your new address. We'll handle the relocation and ensure your internet and networking are up and running quickly.",
    },
    {
        question:
            "Can I upgrade or downgrade my internet plan as my business grows?",
        answer: "Yes. All our internet plans are scalable. You can adjust your bandwidth or service package anytime to fit your business needs.",
    },
    {
        question:
            "Do you provide installation and setup for local networking (LAN/WLAN)?",
        answer: "Absolutely. Our engineers handle everything from cabling to router and firewall setup, ensuring your business network is optimized and secure.",
    },
    {
        question: "How do I become a Digitekhub business partner or reseller?",
        answer: "Contact us via our partnership page. We offer reseller and merchant programs for businesses that want to provide internet services under our brand.",
    },
];

// ─────────────────────────────────────────────
// INTERNET PLANS
//
// IMPORTANT BUG FIXED:
// In our-plans/page.tsx, the state variable was named
// `isBusiness` but showed HomePlans when true and
// BusinessPlans when false — the arrays were swapped.
// This is corrected here with clear naming.
//
// Both arrays are named accurately to their content.
// ─────────────────────────────────────────────

export type PlanFeature = {
    text: string;
};

export type Plan = {
    name: string;
    speed: string;
    monthlyPrice: string;
    installationFee: string;
    vat: string;
    totalFirstCost: string;
    features: string[];
    highlighted?: boolean; // for "Most Popular" badge
};

export const HOME_PLANS: Plan[] = [
    {
        name: "Fiber Essential",
        speed: "30 Mbps",
        monthlyPrice: "₦21,500",
        installationFee: "₦85,000",
        vat: "₦7,987.50",
        totalFirstCost: "₦114,487.50",
        features: [
            "6+ connected devices",
            "Unlimited Download",
            "HD Streaming (1 TV)",
            "5G WiFi Support",
        ],
    },
    {
        name: "Fiber Plus",
        speed: "50 Mbps",
        monthlyPrice: "₦32,000",
        installationFee: "₦85,000",
        vat: "₦8,775",
        totalFirstCost: "₦125,775",
        features: [
            "8+ connected devices",
            "Unlimited Download",
            "Full HD Streaming (2 TVs)",
            "5G WiFi Support",
        ],
    },
    {
        name: "Fiber Pro",
        speed: "60 Mbps",
        monthlyPrice: "₦36,000",
        installationFee: "₦85,000",
        vat: "₦9,075",
        totalFirstCost: "₦130,075",
        features: [
            "10+ connected devices",
            "Unlimited Download",
            "4K Streaming (3 TVs)",
            "5G WiFi Support",
        ],
        highlighted: true,
    },
    {
        name: "Fiber Max",
        speed: "75 Mbps",
        monthlyPrice: "₦52,000",
        installationFee: "₦85,000",
        vat: "₦10,275",
        totalFirstCost: "₦147,275",
        features: [
            "20+ connected devices",
            "Unlimited Download",
            "Ultra HD Streaming",
            "Perfect for businesses and gamers",
        ],
    },
    {
        name: "Fiber Ultra",
        speed: "100 Mbps",
        monthlyPrice: "₦78,500",
        installationFee: "₦85,000",
        vat: "₦12,262.50",
        totalFirstCost: "₦175,762.50",
        features: [
            "30+ connected devices",
            "Unlimited Download",
            "Ultra 4K Streaming",
            "Heavy-duty usage",
        ],
    },
];

export const BUSINESS_PLANS: Plan[] = [
    {
        name: "Fiber Pro",
        speed: "60 Mbps",
        monthlyPrice: "₦36,000",
        installationFee: "₦85,000",
        vat: "₦9,075",
        totalFirstCost: "₦130,075",
        features: [
            "10+ connected devices",
            "Unlimited Download",
            "Full HD Streaming (3 TVs)",
            "5G WiFi Support",
        ],
    },
    {
        name: "Fiber Max",
        speed: "75 Mbps",
        monthlyPrice: "₦52,000",
        installationFee: "₦85,000",
        vat: "₦10,275",
        totalFirstCost: "₦147,275",
        features: [
            "20+ connected devices",
            "Unlimited Download",
            "4K Streaming (5 TVs)",
            "5G WiFi Support",
        ],
    },
    {
        name: "Fiber Ultra",
        speed: "100 Mbps",
        monthlyPrice: "₦78,500",
        installationFee: "₦85,000",
        vat: "₦12,262.50",
        totalFirstCost: "₦175,762.50",
        features: [
            "30+ connected devices",
            "Unlimited Download",
            "Ultra HD Streaming",
            "Perfect for offices",
        ],
        highlighted: true,
    },
    {
        name: "Enterprise Pro",
        speed: "200 Mbps",
        monthlyPrice: "₦120,000",
        installationFee: "₦85,000",
        vat: "₦15,375",
        totalFirstCost: "₦220,375",
        features: [
            "35+ connected devices",
            "Unlimited Download",
            "Ultra 4K Streaming",
            "No data caps",
            "30-day validity",
            "Premium Support",
        ],
    },
    {
        name: "Enterprise Max",
        speed: "300 Mbps",
        monthlyPrice: "₦140,000",
        installationFee: "₦85,000",
        vat: "₦16,875",
        totalFirstCost: "₦241,875",
        features: [
            "40+ connected devices",
            "Unlimited Download",
            "Ultra 4K Streaming",
            "No data caps",
            "30-day validity",
            "Premium Support",
        ],
    },
    {
        name: "Enterprise Ultra",
        speed: "400 Mbps",
        monthlyPrice: "₦180,000",
        installationFee: "₦85,000",
        vat: "₦19,875",
        totalFirstCost: "₦284,875",
        features: [
            "60+ connected devices",
            "Unlimited Download",
            "Ultra 4K Streaming",
            "No data caps",
            "30-day validity",
            "Premium Support",
        ],
    },
    {
        name: "Enterprise Ultra Plus",
        speed: "1000 Mbps",
        monthlyPrice: "₦250,000",
        installationFee: "₦85,000",
        vat: "₦25,125",
        totalFirstCost: "₦360,125",
        features: [
            "85+ connected devices",
            "Unlimited Download",
            "Ultra 4K Streaming",
            "No data caps",
            "30-day validity",
            "Premium Support",
        ],
    },
];

// Shared installation fee note — displayed once on plans page
// instead of being repeated on every single card
export const INSTALLATION_FEE_NOTE =
    "All plans include a one-time installation fee of ₦85,000 (VAT inclusive in total).";

// ─────────────────────────────────────────────
// CONTACT PAGE — SUPPORT CHANNELS
// Was inline JSX in contact-us/page.tsx
// ─────────────────────────────────────────────

export type ContactChannel = {
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    href: string;
    iconKey: string;
};

export const CONTACT_CHANNELS: ContactChannel[] = [
    {
        id: "customer-care",
        title: "Customer Care",
        description:
            "Call us directly to speak with a support expert. We're happy to assist with plan selection, consultation, installation, billing, or technical issues.",
        actionLabel: CONTACT_INFO.networkPhone.display,
        href: CONTACT_INFO.networkPhone.href,
        iconKey: "phone",
    },
    {
        id: "sales-phone",
        title: "Sales Enquiry",
        description:
            "Speak with a sales expert about plan selection, custom solutions, and getting started with Digitekhub for your business.",
        actionLabel: CONTACT_INFO.phone.display,
        href: CONTACT_INFO.phone.href,
        iconKey: "phone",
    },
    {
        id: "sales-email",
        title: "Email Sales",
        description:
            "Interested in Digitekhub for your home or business? Our sales team will help you choose the right plan and guide you through setup.",
        actionLabel: CONTACT_INFO.email.display,
        href: CONTACT_INFO.email.href,
        iconKey: "email",
    },
    {
        id: "whatsapp",
        title: "WhatsApp",
        description:
            "Chat with us on WhatsApp for quick, real-time support — ideal for checking plan availability, asking questions, or reporting issues.",
        actionLabel: CONTACT_INFO.whatsapp.display,
        href: CONTACT_INFO.whatsapp.href,
        iconKey: "whatsapp",
    },
];

// ─────────────────────────────────────────────
// METADATA — SEO
// Centralizes page titles and descriptions used
// in layout.tsx and individual page metadata exports
// ─────────────────────────────────────────────

export const PAGE_METADATA = {
    home: {
        title: "Digitek Network | Reliable & Affordable Business Internet Provider in Nigeria",
        description:
            "Digitek Network provides fast, secure, and scalable internet solutions for businesses, schools, hotels, startups, and enterprises across Nigeria. Stay connected 24/7 with expert support.",
    },
    plans: {
        title: "Internet Plans | Digitek Network",
        description:
            "Explore Digitek Network's home and business fiber internet plans. Fast speeds, unlimited data, transparent pricing.",
    },
    contact: {
        title: "Contact Digitek Network | Get Support or Sales Assistance",
        description:
            "Reach Digitek Network's customer support or sales team for assistance with your internet plans, installation, or technical issues.",
    },
    shop: {
        title: "Shop | Digitek Network",
        description:
            "Digitek Network shop — coming soon. Browse networking hardware and accessories.",
    },
} as const;
