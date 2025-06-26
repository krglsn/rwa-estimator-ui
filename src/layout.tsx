import type {FunctionalComponent} from 'preact';
import {useWallet} from './lib/useWallet';
import {useToken} from "./context/TokenContext.tsx";
import {useEffect, useState} from "preact/hooks";
import type {JsonRpcProvider} from "ethers";
import {ethers} from "ethers";
import {CONTRACT_CONFIG} from "./config/chain.ts";
import RealEstateTokenABI from "./abi/RealEstateToken.json";

interface LayoutProps {
    children: preact.ComponentChildren;
    provider: JsonRpcProvider | null;
}

const Layout: FunctionalComponent<LayoutProps> = ({children, provider}) => {
    const {account, connect} = useWallet()
    const path = window.location.pathname;
    const {selectedTokenId, setSelectedTokenId} = useToken();
    const [nativeBalance, setNativeBalance] = useState<number>(0);
    const [rwaBalance, setRwaBalance] = useState<number>(0);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, provider);

    useEffect(() => {

            async function updateBalances() {
                if (account && provider) {
                    try {
                        setRwaBalance(Number(await token.balanceOf(account, selectedTokenId)))
                        setNativeBalance(Number(await provider.getBalance(account)))
                    } catch (e: unknown) {
                        if (e instanceof Error) {
                            console.error("Error calling contract:", e.message);
                        } else {
                            console.error("Unknown error:", e);
                        }
                    }

                } else {
                    setNativeBalance(0);
                    setRwaBalance(0);
                }
            }

            updateBalances();
        },
        [selectedTokenId, account]
    )

    return (<div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="navbar bg-base-100">
            <div className="navbar-start">
                <div className="w-40 rounded-full">
                    <a href="/">
                        <img
                            alt="RWA Estimator Logo"
                            src="src/assets/logo4.png"/>
                    </a>
                </div>
            </div>
            <div className="navbar-center">
                <ul className="menu menu-horizontal text-lg">
                    <li><a className={path === "/" ? "btn btn-soft" : ""} href="/">Admin</a></li>
                    <li><a className={path === "/appraiser" ? "btn btn-soft" : ""} href="/appraiser">Appraiser</a>
                    </li>
                    <li><a className={path === "/depositor" ? "btn btn-soft" : ""} href="/depositor">Depositor</a>
                    </li>
                </ul>
            </div>
            <div className="navbar-end p-6">
                <div className="flex mx-8 gap-2">
                    <div className="flex justify-center">
                        <select
                            defaultValue="0"
                            value={selectedTokenId}
                            className="select"
                            onChange={(e) => setSelectedTokenId(
                                parseInt((e.target as HTMLInputElement).value) || 0
                            )}
                        >
                            <option disabled={true}>Choose Token ID</option>
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2">
                    {account ? (
                        <>
                            <div
                                className="tooltip tooltip-left tooltip-secondary"
                                data-tip={
                                    `WEI:${nativeBalance} RWA:${rwaBalance}`
                                }>
                                    {account.slice(0, 6)}...{account.slice(-4)}
                            </div>
                        </>
                    ) : (
                        <button onClick={connect} className="btn btn-sm btn-primary">
                            Connect Wallet
                        </button>
                    )}
                </div>

            </div>
        </div>
        <div className="divider divider-neutral m-0 p-0"></div>
        {/* Main */}
        <main className="bg-base-200/30 flex-grow">
            {children}
        </main>
    </div>);
};

export default Layout;