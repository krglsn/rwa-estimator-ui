import {type BrowserProvider, ethers, type JsonRpcProvider, type WebSocketProvider, ZeroAddress} from "ethers";
import {useWallet} from "../lib/useWallet.ts";
import {useContext, useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateToken from "../abi/RealEstateToken.json";
import Pool from "../abi/Pool.json";
import {NotificationContext} from "../context/NotificationContext.tsx";
import {useToken} from "../context/TokenContext.tsx";

type Props = {
    browserProvider: BrowserProvider | null
    provider: JsonRpcProvider | null
    wsProvider: WebSocketProvider | null
}

export default function Claim({provider, browserProvider}: Props) {

    const {selectedTokenId} = useToken();
    const {account,} = useWallet();
    const {show} = useContext(NotificationContext);
    const [claimableA, setClaimableA] = useState<number>(0);
    const [claimableD, setClaimableD] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, provider);

    const handleClaimAppraiser = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const poolAddress = await token.getPool(selectedTokenId);
            const pool = new ethers.Contract(poolAddress, Pool.abi, signer);
            const tx = await pool.claimAppraiser();
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                show({
                    message: 'Transaction confirmed! ' + tx.hash,
                    type: 'success',
                });
            } else {
                show({
                    message: 'Transaction failed! ' + tx.hash,
                    type: 'error'
                });
            }
            setClaimableA(await pool.canClaimAppraiser(account))
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Error calling contract:", err.message);
                show({
                    message: 'Transaction error! ' + err.message,
                    type: 'error',
                });
            } else {
                console.error("Unknown tx error:", err);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleClaimDepositor = async (e: Event) => {
        e.preventDefault();
        setLoading2(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const poolAddress = await token.getPool(selectedTokenId);
            const pool = new ethers.Contract(poolAddress, Pool.abi, signer);
            const tx = await pool.claimDepositor();
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                show({
                    message: 'Transaction confirmed! ' + tx.hash,
                    type: 'success',
                });
            } else {
                show({
                    message: 'Transaction failed! ' + tx.hash,
                    type: 'error'
                });
            }
            setClaimableD(await pool.canClaimDepositor(account))
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Error calling contract:", err.message);
                show({
                    message: 'Transaction error! ' + err.message,
                    type: 'error',
                });
            } else {
                console.error("Unknown tx error:", err);
            }
        } finally {
            setLoading2(false);
        }
    }

    useEffect(() => {
            async function updateClaimable() {
                if (selectedTokenId !== null && account) {
                    const poolAddress = await token.getPool(selectedTokenId)
                    console.log("Pool address: ", poolAddress)
                    if (poolAddress !== ZeroAddress) {
                        try {
                            const pool = new ethers.Contract(poolAddress, Pool.abi, provider)
                            const res: number = await pool.canClaimAppraiser(account)
                            setClaimableA(res)
                            const res2: number = await pool.canClaimDepositor(account)
                            setClaimableD(res2)
                        } catch (e: unknown) {
                            if (e instanceof Error) {
                                console.error("Error calling contract:", e.message);
                            } else {
                                console.error("Unknown error:", e);
                            }
                        }
                    } else {
                        setClaimableA(0)
                        setClaimableD(0)
                    }
                } else {
                    setClaimableA(0)
                    setClaimableD(0)
                }


            }

            updateClaimable();
        }, [account, selectedTokenId]
    )


    return (
        <div className="flex justify-center">
            <div className="card bg-base-100 w-100 card-border card-md shadow-md justify-center p-6">
                <div className="card-title justify-center">
                    <span>Claim</span>
                </div>
                <div className="card-body justify-center">
                    <div className="stats shadow w-full">
                        <div className="stat overflow-hidden">
                            <div className="stat-title">You can claim</div>
                            <div className="stat-value">{claimableA}</div>
                            <div className="stat-desc">as appraiser</div>
                        </div>
                    </div>
                    <button onClick={handleClaimAppraiser} disabled={!claimableA || loading}
                            className="btn btn-primary">
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"/>
                                Sending tx...
                            </>
                        ) : (
                            "Claim"
                        )}
                    </button>
                    <div className="divider"></div>
                    <div className="stats shadow w-full">
                        <div className="stat overflow-hidden">
                            <div className="stat-title">You can claim</div>
                            <div className="stat-value">{claimableD}</div>
                            <div className="stat-desc">as depositor</div>
                        </div>
                    </div>
                    <button onClick={handleClaimDepositor} disabled={!claimableD || loading2}
                            className="btn btn-primary">
                        {loading2 ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"/>
                                Sending tx...
                            </>
                        ) : (
                            "Claim"
                        )}
                    </button>
                </div>
            </div>
        </div>

    )
}
