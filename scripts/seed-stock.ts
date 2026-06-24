/**
 * scripts/seed-stock.ts
 *
 * Run ONCE after setting up Upstash Redis to initialize stock
 * quantities. Safe to run again later to reset/restock —
 * it overwrites with whatever quantities you set below.
 *
 * USAGE:
 *   npx tsx scripts/seed-stock.ts
 *
 * (If you don't have tsx installed: npm install -D tsx)
 *
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * to be set — either in your shell environment, or this script
 * will read them from .env.local if you use a loader. Easiest:
 * run with dotenv-cli:
 *   npx dotenv -e .env.local -- npx tsx scripts/seed-stock.ts
 */

import { setStock } from "@/src/lib/stock";

// EDIT THESE QUANTITIES to match your actual current inventory
const INITIAL_STOCK: Record<string, number> = {
    "powerbank-10000": 25,
    "powerbank-20000": 25,
};

async function main() {
    console.log("Seeding stock...\n");

    for (const [variantId, quantity] of Object.entries(INITIAL_STOCK)) {
        await setStock(variantId, quantity);
        console.log(`  ${variantId}: ${quantity} units`);
    }

    console.log("\nDone. Stock is now live in Redis.");
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
