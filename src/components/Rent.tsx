import {type BrowserProvider, ethers, type JsonRpcProvider, ZeroAddress} from "ethers";
import {useWallet} from "../lib/useWallet.ts";
import {useContext, useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateToken from "../abi/RealEstateToken.json";
import Pool from "../abi/Pool.json";
import {NotificationContext} from "./NotificationContext.tsx";

type Props = {
    browserProvider: BrowserProvider | null
    provider: JsonRpcProvider | null
}

export default function Rent({provider, browserProvider}: Props) {

    const {account,} = useWallet();
    const {show} = useContext(NotificationContext);
    const [tokenId, setTokenId] = useState<number>(0)
    const [rentDue, setRentDue] = useState<number>(0);
    const [safetyDepositDue, setSafetyDepositDue] = useState<number>(0);
    const [liquidable, setLiquidable] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, provider);

    const handlePayRent = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const poolAddress = await token.getPool(tokenId);
            const pool = new ethers.Contract(poolAddress, Pool.abi, signer);
            const tx = await pool.payRent(rentDue, {value: rentDue});
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
            async function updateRentInfo() {
                const poolAddress = await token.getPool(tokenId)
                if (poolAddress !== ZeroAddress) {
                    try {
                        const pool = new ethers.Contract(poolAddress, Pool.abi, provider);
                        setRentDue(await pool.rentDue());
                        setSafetyDepositDue(await pool.safetyAmountDue())
                        setLiquidable(await pool.canLiquidate());
                    } catch (e: unknown) {
                        if (e instanceof Error) {
                            console.error("Error calling contract:", e.message);
                        } else {
                            console.error("Unknown error:", e);
                        }
                    }
                } else {
                    setRentDue(0)
                    setLiquidable(false)
                    setSafetyDepositDue(0)
                }


            }

            updateRentInfo();
        }, [account, tokenId]
    )


    return (
        <div className="flex justify-center">
            <div className="card bg-base-100 w-100 card-border card-md shadow-md justify-center p-6">
                <div className="card-title justify-center">
                    <span>Rent & Obligations</span>
                </div>
                <div className="card-body justify-center">
                    <fieldset className="fieldset rounded-box">
                        <legend className="fieldset-legend">Token Id</legend>
                        <label className="label">Token ID</label>
                        <input
                            type="number"
                            name="tokenId"
                            min="0"
                            className="input"
                            placeholder="id"
                            value={tokenId}
                            onChange={(
                                e) => setTokenId(
                                parseInt((e.target as HTMLInputElement).value) || 0
                            )}
                        />
                        <p className="label">
                            <span>Rent due: </span>
                            <span> {rentDue}</span>
                            <span>Safety due:</span>
                            <span>{safetyDepositDue}</span>
                        </p>
                        <p className="label">
                            <span>Can liquidate: </span>
                            <span> {liquidable ? "Yes" : "No"}</span>
                        </p>
                    </fieldset>
                    <button onClick={handlePayRent} disabled={!rentDue || loading} className="btn btn-primary">
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"/>
                                Sending tx...
                            </>
                        ) : (
                            "Pay rent"
                        )}
                    </button>
                </div>
            </div>
        </div>

    )
}
