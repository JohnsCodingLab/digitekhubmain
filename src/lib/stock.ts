/**
 * lib/stock.ts
 *
 * Stock tracking via Upstash Redis (REST client — works in
 * Vercel's serverless/edge environment, no persistent
 * connection needed).
 *
 * SETUP REQUIRED (see SHOP_SETUP.txt for full walkthrough):
 *   1. Vercel dashboard → Storage → Create → Upstash Redis
 *      (or create directly at upstash.com and connect)
 *   2. This auto-populates two env vars in your project:
 *        UPSTASH_REDIS_REST_URL
 *        UPSTASH_REDIS_REST_TOKEN
 *   3. Run the seed script (scripts/seed-stock.ts) once to set
 *      initial quantities — see SHOP_SETUP.txt
 *
 * WHY REDIS AND NOT A JSON FILE:
 * Vercel's filesystem is ephemeral and read-only in production
 * — writes don't persist between requests/deployments, and
 * concurrent requests could both read "1 in stock" and both
 * succeed, overselling. Redis's INCRBY/DECRBY are atomic at
 * the database level, so two simultaneous checkout attempts on
 * the last unit can't both succeed.
 *
 * KEY SCHEME: stock:<variantId>  → integer quantity available
 */

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

function stockKey(variantId: string): string {
    return `stock:${variantId}`;
}

/**
 * Returns current stock for a variant. Returns 0 (not null) if
 * the key has never been set — treats "unseeded" the same as
 * "out of stock" so a forgotten seed step fails safe (blocks
 * sales) rather than failing open (allows infinite oversells).
 */
export async function getStock(variantId: string): Promise<number> {
    const value = await redis.get<number>(stockKey(variantId));
    return typeof value === "number" ? value : 0;
}

export async function getAllStock(
    variantIds: string[],
): Promise<Record<string, number>> {
    if (variantIds.length === 0) return {};

    const keys = variantIds.map(stockKey);
    const values = await redis.mget<number[]>(...keys);

    const result: Record<string, number> = {};
    variantIds.forEach((id, i) => {
        result[id] = typeof values[i] === "number" ? values[i] : 0;
    });
    return result;
}

/**
 * Atomically reserves `quantity` units of a variant by
 * decrementing stock, but ONLY if enough stock exists — this
 * is the function that prevents overselling.
 *
 * Implementation note: Redis DECRBY alone isn't sufficient
 * because it would happily go negative. We use a small Lua
 * script via `eval` so the check-then-decrement is a single
 * atomic operation on the Redis server, closing the race
 * condition window between "check stock" and "decrement stock"
 * that would otherwise exist if done as two separate calls.
 *
 * Returns true if the reservation succeeded (stock was
 * decremented), false if there wasn't enough stock.
 */
export async function reserveStock(
    variantId: string,
    quantity: number,
): Promise<boolean> {
    const script = `
    local current = redis.call("GET", KEYS[1])
    if current == false then
      return -1
    end
    current = tonumber(current)
    if current < tonumber(ARGV[1]) then
      return 0
    end
    redis.call("DECRBY", KEYS[1], ARGV[1])
    return 1
  `;

    const result = await redis.eval(script, [stockKey(variantId)], [quantity]);

    // -1 = key never seeded (treat as no stock), 0 = insufficient
    // stock, 1 = success
    return result === 1;
}

/**
 * Releases a previously reserved quantity back to stock — used
 * if payment verification fails AFTER stock was reserved, so a
 * failed/abandoned payment doesn't permanently lose inventory.
 */
export async function releaseStock(
    variantId: string,
    quantity: number,
): Promise<void> {
    await redis.incrby(stockKey(variantId), quantity);
}

/**
 * Admin helper — sets stock to an exact value. Used by the
 * seed script and for manual restocking.
 */
export async function setStock(
    variantId: string,
    quantity: number,
): Promise<void> {
    await redis.set(stockKey(variantId), quantity);
}

// ── Multi-variant (cart) reservation ────────────────────────
// Used when an order contains more than one line item (e.g.
// 2x 10,000mAh + 1x 20,000mAh in the same checkout). Reservation
// must be ALL-OR-NOTHING — if the 20,000mAh is sold out, the
// 10,000mAh units should NOT be reserved either, otherwise a
// failed order silently locks up stock the customer never pays
// for.

export interface StockLineItem {
    variantId: string;
    quantity: number;
}

/**
 * Atomically reserves stock for multiple variants in a single
 * order. Either ALL line items succeed, or NONE do — implemented
 * as one Lua script so the whole check-and-decrement set runs as
 * one atomic operation on the Redis server (no window where a
 * concurrent request could interleave between line items).
 *
 * Returns { success: true } if all reservations succeeded, or
 * { success: false, failedVariantId } naming the first variant
 * that didn't have enough stock, so the caller can show a
 * specific error.
 */
export async function reserveStockBulk(
    items: StockLineItem[],
): Promise<{ success: boolean; failedVariantId?: string }> {
    if (items.length === 0) {
        return { success: true };
    }

    // KEYS = one stock key per line item
    // ARGV = matching quantities, in the same order
    const script = `
    local n = #KEYS
    -- First pass: verify every key has enough stock. If any
    -- fails, bail out before decrementing anything.
    for i = 1, n do
      local current = redis.call("GET", KEYS[i])
      if current == false then
        return i
      end
      if tonumber(current) < tonumber(ARGV[i]) then
        return i
      end
    end
    -- Second pass: all checks passed, now actually decrement.
    for i = 1, n do
      redis.call("DECRBY", KEYS[i], ARGV[i])
    end
    return 0
  `;

    const keys = items.map((item) => stockKey(item.variantId));
    const args = items.map((item) => item.quantity);

    const result = await redis.eval(script, keys, args);

    if (result === 0) {
        return { success: true };
    }

    // result is the 1-indexed position of the failed item
    const failedIndex = Number(result) - 1;
    return { success: false, failedVariantId: items[failedIndex]?.variantId };
}

/**
 * Releases multiple reserved quantities back to stock — used if
 * payment verification fails after a multi-item reservation
 * succeeded, so a failed/abandoned payment doesn't permanently
 * lose inventory across the whole cart.
 */
export async function releaseStockBulk(items: StockLineItem[]): Promise<void> {
    await Promise.all(
        items.map((item) => releaseStock(item.variantId, item.quantity)),
    );
}
