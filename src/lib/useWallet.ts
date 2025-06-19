// src/lib/useWallet.ts
import { useState } from 'preact/hooks'
import { connectWallet } from './Wallet'

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null)

  async function connect() {
    const acc = await connectWallet()
    if (acc) setAccount(acc)
  }

  return { account, connect }
}
