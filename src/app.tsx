import {useEffect, useState} from 'preact/hooks'
import {BrowserProvider, type Provider, WebSocketProvider} from 'ethers'
import './index.css'
import Home from "./pages/Home.tsx";
import {CONTRACT_CONFIG} from "./config/chain.ts";

export function App() {

    const [provider, setProvider] = useState<Provider | null>(null)
    const [walletProvider, setWalletProvider] = useState<BrowserProvider | null>(null)

    useEffect(() => {

        let wsProvider = new WebSocketProvider(CONTRACT_CONFIG.wsRpc);
        setProvider(wsProvider)

        return () => {
            wsProvider.removeAllListeners()
            wsProvider.destroy?.()
        }

    }, [])

    useEffect(() => {
        const initWallet = async () => {
            // @ts-ignore
            if (window.ethereum) {
                // @ts-ignore
                const provider = new BrowserProvider(window.ethereum);
                setWalletProvider(provider);
            }
        };
        initWallet();
        return () => {
            // @ts-ignore
            window.ethereum?.removeAllListeners("accountsChanged");
        };
    }, []);

    return <Home provider={provider}/>;

}
