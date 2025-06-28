import {type BrowserProvider, ethers, type JsonRpcProvider, ZeroAddress} from "ethers";
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
}

export default function Rent({provider, browserProvider}: Props) {

    const {selectedTokenId} = useToken();
    const {account,} = useWallet();
    const {show} = useContext(NotificationContext);
    const [rentDue, setRentDue] = useState<number>(0);
    const [safetyDepositDue, setSafetyDepositDue] = useState<number>(0);
    const [liquidable, setLiquidable] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, provider);

    const handleSafetyDeposit = async (e: Event) => {
        e.preventDefault();
        setLoading2(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const poolAddress = await token.getPool(selectedTokenId);
            const pool = new ethers.Contract(poolAddress, Pool.abi, signer);
            const tx = await pool.paySafety(safetyDepositDue, {value: safetyDepositDue});
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
            setRentDue(await pool.rentDue());
            setSafetyDepositDue(await pool.safetyAmountDue())
            setLiquidable(await pool.canLiquidate());
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

    const handlePayRent = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const poolAddress = await token.getPool(selectedTokenId);
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
            setRentDue(await pool.rentDue());
            setSafetyDepositDue(await pool.safetyAmountDue())
            setLiquidable(await pool.canLiquidate());
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
                const poolAddress = await token.getPool(selectedTokenId)
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
        }, [account, selectedTokenId]
    )


    return (
        <div className="flex justify-center">
            <div className="card bg-base-100 w-full card-border card-sm shadow-md p-6">
                <div className="card-title justify-center">
                    <span>Rent & Obligations</span>
                </div>
                <div className="card-body items-center">
                    <div className="flex flex-col w-60 gap-4">
                        <div className="stats shadow w-full">
                            <div className="stat overflow-hidden">
                                <div className="stat-title">Rent due</div>
                                <div className="stat-value">{rentDue ?? "n/a"}</div>
                                <div className="stat-desc">Liquidable: {liquidable ?
                                    <div className="badge badge-sm badge-soft badge-accent">yes</div> :
                                    <div className="badge badge-sm badge-soft badge-success">no</div>}
                                </div>
                            </div>
                        </div>
                        <div className="stats shadow w-full">
                            <div className="stat overflow-hidden">
                                <div className="stat-title">Safety deposit due</div>
                                <div className="stat-value">{safetyDepositDue ?? "n/a"}</div>
                                <div className="stat-desc">Liquidable: {liquidable ?
                                    <div className="badge badge-sm badge-soft badge-accent">yes</div> :
                                    <div className="badge badge-sm badge-soft badge-success">no</div>}
                                </div>
                            </div>
                        </div>
                        <button onClick={handlePayRent} disabled={!rentDue || loading}
                                className="w-full btn btn-primary">
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"/>
                                    Sending tx...
                                </>
                            ) : (
                                "Pay rent"
                            )}
                        </button>
                        <button onClick={handleSafetyDeposit} disabled={!safetyDepositDue || loading2}
                                className="w-full btn btn-primary">
                            {loading2 ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"/>
                                    Sending tx...
                                </>
                            ) : (
                                "Pay safety deposit"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}
