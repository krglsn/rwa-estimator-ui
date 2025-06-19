// src/lib/wallet.ts
import {ethers} from 'ethers'

export async function connectWallet(): Promise<string | null> {
    // @ts-ignore
    if (typeof window.ethereum === 'undefined') return null


    try {
        // @ts-ignore
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])
        return accounts[0] || null
    } catch (err) {
        console.error('Wallet connection error:', err)
        return null
    }
}
