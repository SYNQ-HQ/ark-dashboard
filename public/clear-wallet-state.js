/**
 * Utility script to clear all wallet connection state
 * Run this in browser console if you get stuck in a bad state:
 * 
 * Copy and paste this entire function into your browser console, then call:
 * clearWalletState()
 */

function clearWalletState() {
    console.log('🧹 Clearing all wallet state...');

    // Clear all wagmi-related localStorage keys
    const keysToRemove = [
        'wagmi.store',
        'wagmi.recentConnectorId',
        'wagmi.wallet',
        'wagmi.connected',
        'wagmi.cache',
        'wagmi.injected.shimDisconnect'
    ];

    let removed = 0;
    keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            removed++;
            console.log(`✓ Removed: ${key}`);
        }
    });

    // Clear any connector-specific disconnected flags
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('wagmi.') && key.includes('.disconnected')) {
            localStorage.removeItem(key);
            removed++;
            console.log(`✓ Removed: ${key}`);
        }
    });

    // Clear RainbowKit keys
    const rkKeys = Object.keys(localStorage).filter(key => key.startsWith('rk-'));
    rkKeys.forEach(key => {
        localStorage.removeItem(key);
        removed++;
        console.log(`✓ Removed: ${key}`);
    });

    console.log(`\n✅ Cleared ${removed} localStorage entries`);
    console.log('🔄 Please refresh the page to reconnect your wallet');
}

// Auto-run if this script is executed
if (typeof window !== 'undefined') {
    console.log('Wallet state cleanup utility loaded. Call clearWalletState() to clear all wallet data.');
}
