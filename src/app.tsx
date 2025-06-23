import {useEffect, useState} from 'preact/hooks'
import {BrowserProvider, JsonRpcProvider, WebSocketProvider} from 'ethers'
import './index.css'
import Home from "./pages/Home.tsx";
import {CONTRACT_CONFIG} from "./config/chain.ts";
import {Router} from "preact-router";
import Appraiser from "./pages/Appraiser.tsx";

export function App() {

    const [provider, setProvider] = useState<JsonRpcProvider | null>(null)
    const [walletProvider, setWalletProvider] = useState<BrowserProvider | null>(null)
    const [wsProvider, setWsProvider] = useState<WebSocketProvider | null>(null)


    useEffect(() => {

        let wsProvider = new WebSocketProvider(CONTRACT_CONFIG.wsRpc);
        setWsProvider(wsProvider)

        return () => {
            wsProvider.removeAllListeners()
            wsProvider.destroy?.()
        }

    }, [])

    useEffect(() => {

        let rpcProvider: JsonRpcProvider = new JsonRpcProvider(CONTRACT_CONFIG.rpc);

        rpcProvider.getBlockNumber().then(() => {
            setProvider(rpcProvider)
            console.log("RPC provider set")
        }).catch((err) => {
            console.error("Failed to connect to provider:", err);
        });

        return () => {
            rpcProvider.removeAllListeners()
            rpcProvider.destroy?.()
        }

    }, [])

    useEffect(() => {
        const initWallet = async () => {
            // @ts-ignore
            if (window.ethereum) {
                // @ts-ignore
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const addr = await signer.getAddress();
                console.log("Wallet address: ", addr);
                setWalletProvider(provider);
            }
        };
        initWallet();
        return () => {
            // @ts-ignore
            window.ethereum?.removeAllListeners("accountsChanged");
        };
    }, []);

    return (provider && wsProvider && walletProvider) ?
        <Router>
            <Home path="/" provider={provider} wsProvider={wsProvider} browserProvider={walletProvider}/>
            <Appraiser path="/appraiser" provider={provider} wsProvider={wsProvider} browserProvider={walletProvider}/>
        </Router> :
        <div>Providers are not available</div>

}
