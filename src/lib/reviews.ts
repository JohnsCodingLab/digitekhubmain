export type Review = {
    name: string;
    role?: string;
    company?: string;
    rating: 1 | 2 | 3 | 4 | 5;
    text: string;
    imageKey?: string;
};

export const REVIEWS: Review[] = [
    {
        name: "Michael Olamide",
        role: "CEO",
        company: "Startup Inc.",
        rating: 5,
        text: "This service transformed our business. Reliable and affordable!",
        imageKey: "image1",
    },
    {
        name: "Richard Lawson",
        role: "CTO",
        company: "Tech Corp",
        rating: 5,
        text: "The best internet solutions we've used. Scalable and smooth.",
    },
    {
        name: "Amaka Chukwu",
        role: "Operations Manager",
        company: "Lekki Logistics Hub",
        rating: 4,
        text: "Solid uptime and the support team actually picks up the phone. Big improvement over our last provider.",
    },
];
