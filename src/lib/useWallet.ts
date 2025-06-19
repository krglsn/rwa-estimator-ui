// src/lib/useWallet.ts
import {useEffect, useState} from 'preact/hooks'

export function useWallet() {
    const [account, setAccount] = useState<string | null>(null)

    async function connect() {
        // @ts-ignore
        if (!window.ethereum) return null
        // @ts-ignore
        const accounts: string[] = await window.ethereum.request({method: 'eth_requestAccounts'})
        if (accounts.length > 0) setAccount(accounts[0])

    }

    useEffect(() => {
        // @ts-ignore
        if (!window.ethereum) return;

        async function checkConnection() {
            // @ts-ignore
            const accounts: string[] = await window.ethereum.request({method: 'eth_accounts'});
            console.log("Check connection", accounts);
            if (accounts.length > 0) setAccount(accounts[0]);
        }

        checkConnection()

        const handleAccountsChanged = (accounts: string[]) => {
            console.log("Accounts changed", accounts);
            setAccount(accounts[0] ?? null)
        }

        // @ts-ignore
        window.ethereum.on('accountsChanged', handleAccountsChanged)
        // @ts-ignore
        return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    }, [])

    return {account, connect}
}
