'use server'

import { createPublicClient, http, formatUnits, parseAbi } from 'viem'
import { bsc } from 'viem/chains'

const ACT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ACT_CONTRACT_ADDRESS as `0x${string}` || "0x345F6423cEf697926C23dC010Eb1B96f8268bcec"
const RPC_URL = process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed.binance.org/"

const publicClient = createPublicClient({
    chain: bsc,
    transport: http(RPC_URL)
})

const ACT_ABI = parseAbi([
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
])

// In-memory cache for price (60 second TTL)
let priceCache: { price: number; timestamp: number } | null = null
const CACHE_TTL = 60 * 1000 // 60 seconds

/**
 * Fetch ACT price from DexScreener (Primary source)
 * Aggregates liquidity from all AMMs including PancakeSwap
 */
async function getPriceFromDexScreener(): Promise<number | null> {
    try {
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${ACT_CONTRACT_ADDRESS}`,
            { next: { revalidate: 30 }, signal: AbortSignal.timeout(5000) }
        )
        if (!response.ok) return null
        const data = await response.json()
        const pairs = data.pairs || []

        // Filter for BSC pairs and sort by liquidity (USD) descending
        // This ensures we get the price from the most liquid pool (like the UI does)
        const bscPairs = pairs
            .filter((p: any) => p.chainId === 'bsc')
            .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));

        const bestPair = bscPairs[0];

        if (bestPair) {
            console.error(`\n\n###### PRICE DEBUG START ######`);
            console.error(`[Price] DexScreener selected pair: ${bestPair.pairAddress}`);
            console.error(`[Price] Liquidity: $${bestPair.liquidity?.usd}`);
            console.error(`[Price] Price: $${bestPair.priceUsd}`);
            console.error(`###### PRICE DEBUG END ######\n\n`);
            return parseFloat(bestPair.priceUsd);
        }

        return null
    } catch (error) {
        console.warn('[Price] DexScreener failed:', error)
        return null
    }
}

/**
 * Fetch ACT price from GeckoTerminal (Fallback 1)
 * Reliable for on-chain prices
 */
async function getPriceFromGeckoTerminal(): Promise<number | null> {
    try {
        const response = await fetch(
            `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/${ACT_CONTRACT_ADDRESS}`,
            { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }
        )
        if (!response.ok) return null
        const data = await response.json()
        const price = data?.data?.attributes?.price_usd
        return price ? parseFloat(price) : null
    } catch (error) {
        console.warn('[Price] GeckoTerminal failed:', error)
        return null
    }
}

/**
 * Fetch ACT price from CoinGecko API (Fallback 2)
 */
async function getPriceFromCoinGecko(): Promise<number | null> {
    try {
        // CoinGecko requires contract address for BSC tokens
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?contract_addresses=${ACT_CONTRACT_ADDRESS}&vs_currencies=usd`,
            { next: { revalidate: 120 }, signal: AbortSignal.timeout(5000) }
        )
        if (!response.ok) return null
        const data = await response.json()
        const price = data?.[ACT_CONTRACT_ADDRESS.toLowerCase()]?.usd
        return price ? parseFloat(price) : null
    } catch (error) {
        console.warn('[Price] CoinGecko failed:', error)
        return null
    }
}

/**
 * Get ACT token price in USD with multi-source fallback
 * Priority: DexScreener → GeckoTerminal → CoinGecko → Cache → 0
 */
export async function getActPrice(): Promise<number> {
    // Check cache first
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
        // console.log('[Price] Using cached price:', priceCache.price)
        return priceCache.price
    }

    // Try sources in order
    const sources = [
        { name: 'DexScreener', fn: getPriceFromDexScreener },
        { name: 'GeckoTerminal', fn: getPriceFromGeckoTerminal },
        { name: 'CoinGecko', fn: getPriceFromCoinGecko }
    ]

    for (const source of sources) {
        try {
            const price = await source.fn()
            if (price !== null && price > 0) {
                // console.log(`[Price] Got price from ${source.name}:`, price)
                priceCache = { price, timestamp: Date.now() }
                return price
            }
        } catch (e) {
            // Continue to next source
        }
    }

    // All sources failed - return cached price if available (even if stale)
    if (priceCache) {
        console.warn('[Price] All sources failed, using stale cache:', priceCache.price)
        return priceCache.price
    }

    console.error('[Price] All sources failed and no cache available')
    return 0
}

export async function getActBalance(walletAddress: string) {
    try {
        if (!walletAddress.startsWith("0x")) return 0

        const balance = await publicClient.readContract({
            address: ACT_CONTRACT_ADDRESS,
            abi: ACT_ABI,
            functionName: 'balanceOf',
            args: [walletAddress as `0x${string}`]
        })

        const decimals = await publicClient.readContract({
            address: ACT_CONTRACT_ADDRESS,
            abi: ACT_ABI,
            functionName: 'decimals',
        })

        return parseFloat(formatUnits(balance, decimals))
    } catch (error) {
        console.error("Error fetching ACT balance:", error)
        return 0
    }
}

export async function getActPortfolio(walletAddress: string) {
    const [balance, price] = await Promise.all([
        getActBalance(walletAddress),
        getActPrice()
    ])

    return {
        balance,
        price,
        value: balance * price
    }
}
