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
 * Fetch ACT price from PancakeSwap API (fastest for BSC)
 */
async function getPriceFromPancakeSwap(): Promise<number | null> {
    try {
        const response = await fetch(
            `https://api.pancakeswap.info/api/v2/tokens/${ACT_CONTRACT_ADDRESS}`,
            { next: { revalidate: 60 }, signal: AbortSignal.timeout(3000) }
        )
        if (!response.ok) return null
        const data = await response.json()
        return data?.data?.price ? parseFloat(data.data.price) : null
    } catch (error) {
        console.warn('[Price] PancakeSwap failed:', error)
        return null
    }
}

/**
 * Fetch ACT price from CoinGecko API (reliable, good caching)
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
 * Fetch ACT price from DexScreener (slower fallback)
 */
async function getPriceFromDexScreener(): Promise<number | null> {
    try {
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${ACT_CONTRACT_ADDRESS}`,
            { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }
        )
        if (!response.ok) return null
        const data = await response.json()
        const pair = data.pairs?.[0]
        return pair?.priceUsd ? parseFloat(pair.priceUsd) : null
    } catch (error) {
        console.warn('[Price] DexScreener failed:', error)
        return null
    }
}

/**
 * Get ACT token price in USD with multi-source fallback
 * Priority: PancakeSwap → CoinGecko → DexScreener → Cache → 0
 */
export async function getActPrice(): Promise<number> {
    // Check cache first
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL) {
        console.log('[Price] Using cached price:', priceCache.price)
        return priceCache.price
    }

    // Try sources in order of speed/reliability
    const sources = [
        { name: 'PancakeSwap', fn: getPriceFromPancakeSwap },
        { name: 'CoinGecko', fn: getPriceFromCoinGecko },
        { name: 'DexScreener', fn: getPriceFromDexScreener }
    ]

    for (const source of sources) {
        const price = await source.fn()
        if (price !== null && price > 0) {
            console.log(`[Price] Got price from ${source.name}:`, price)
            // Update cache
            priceCache = { price, timestamp: Date.now() }
            return price
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
