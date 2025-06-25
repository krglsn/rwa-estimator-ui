import {type BrowserProvider, ethers, type JsonRpcProvider, type WebSocketProvider, ZeroAddress} from "ethers";
import {useWallet} from "../lib/useWallet.ts";
import {useContext, useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateToken from "../abi/RealEstateToken.json";
import Pool from "../abi/Pool.json";
import {NotificationContext} from "./NotificationContext.tsx";
import {useToken} from "../context/TokenContext.tsx";

type Props = {
    browserProvider: BrowserProvider | null
    provider: JsonRpcProvider | null
    wsProvider: WebSocketProvider | null
}

export default function Claim({provider, browserProvider}: Props) {

    const { selectedTokenId } = useToken();
    const {account,} = useWallet();
    const {show} = useContext(NotificationContext);
    const [claimable, setClaimable] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, provider);

    const handleClaim = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const poolAddress = await token.getPool(selectedTokenId);
            const pool = new ethers.Contract(poolAddress, Pool.abi, signer);
            const tx = await pool.claim();
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

    useEffect(() => {
            async function updateClaimable() {
                if (selectedTokenId !== null && account) {
                    const poolAddress = await token.getPool(selectedTokenId)
                    console.log("Pool address: ", poolAddress)
                    if (poolAddress !== ZeroAddress) {
                        try {
                            const pool = new ethers.Contract(poolAddress, Pool.abi, provider)
                            const res: number = await pool.canClaimAppraiser(account)
                            setClaimable(res);
                        } catch (e: unknown) {
                            if (e instanceof Error) {
                                console.error("Error calling contract:", e.message);
                            } else {
                                console.error("Unknown error:", e);
                            }
                        }
                    } else {
                        setClaimable(0)
                    }
                } else {
                    setClaimable(0)
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
                    <form onSubmit={handleClaim}>
                        <fieldset className="fieldset rounded-box">
                            <legend className="fieldset-legend">Claim rewards</legend>
                            <label className="label">Token ID: {selectedTokenId}</label>
                            <p className="label"><span>Claimable: </span>
                                <span> {claimable}</span></p>
                            <button type="submit" disabled={!claimable || loading} className="btn btn-primary">
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm mr-2"/>
                                        Sending tx...
                                    </>
                                ) : (
                                    "Claim"
                                )}
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>

    )
}
