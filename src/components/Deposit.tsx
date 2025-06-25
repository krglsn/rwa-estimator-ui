import {type BrowserProvider, ethers, type JsonRpcProvider} from "ethers";
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
}

export default function Deposit({provider, browserProvider}: Props) {

    const { selectedTokenId } = useToken();
    const {account,} = useWallet();
    const {show} = useContext(NotificationContext);
    const [depositAmount, setDepositAmount] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [, setBalanceNative] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [, setWithdrawable] = useState<number>(0);
    const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, provider);

    useEffect(() => {

        async function updateDepositable() {
            try {
                const poolAddress = await token.getPool(selectedTokenId)
                const pool = new ethers.Contract(poolAddress, Pool.abi, provider);
                const balance = account ? await provider?.getBalance(account) : 0
                setBalanceNative(Number(balance));
                const withdrawable = await pool.availableWithdraw()
                setWithdrawable(withdrawable);
                setPrice(await pool.getPrice());
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error("Error calling contract:", e.message);
                } else {
                    console.error("Unknown error:", e);
                }
            }
        }

        updateDepositable();

    }, [selectedTokenId, account, provider, depositAmount, withdrawAmount])

    const handleDepositAmount = async (e: Event) => {
        e.preventDefault();
        const amount = parseInt((e.target as HTMLInputElement).value) || 0
        setDepositAmount(amount)
    }

    const handleWithdrawAmount = async (e: Event) => {
        e.preventDefault();
        const amount = parseInt((e.target as HTMLInputElement).value) || 0
        setWithdrawAmount(amount)
    }

    const handleDeposit = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const poolAddress = await token.getPool(selectedTokenId);
            const pool = new ethers.Contract(poolAddress, Pool.abi, signer);
            console.log("Depositing ", depositAmount)
            const tx = await pool.deposit(BigInt(depositAmount), {value: BigInt(depositAmount)});
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

    const handleWithdraw = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const poolAddress = await token.getPool(selectedTokenId);
            const pool = new ethers.Contract(poolAddress, Pool.abi, signer);
            const tokenSign = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, signer);
            console.log("Approving pool to withdraw");
            const txApprove = await tokenSign.setApprovalForAll(poolAddress, true);
            await txApprove.wait();
            console.log("Withdrawing ", withdrawAmount)
            const tx = await pool.withdraw(withdrawAmount);
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


    return (
        <div className="flex justify-center">
            <div className="card bg-base-100 w-120 card-border card-md shadow-md justify-center p-6">
                <div className="card-title justify-center">
                    <span>Deposit & Withdraw</span>
                </div>
                <div className="card-body">
                    <div className="flex flex-col">
                        <legend className="fieldset-legend">Deposit</legend>
                        <div className="join">
                            <label className="input w-3/4 join-item">
                                <span className="label">Amount, WEI</span>
                                <input
                                    onChange={handleDepositAmount}
                                    type="number"
                                    min="0"
                                />
                            </label>
                            <button
                                onClick={handleDeposit}
                                value={depositAmount}
                                className="btn btn-primary join-item"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm"/>
                                ) : (
                                    "Deposit"
                                )}
                            </button>
                        </div>
                        <p className="label"><span>RWA Amount: </span>
                            <span>{price ? Math.floor(depositAmount / Number(price)) : "n/a"}</span></p>
                    </div>
                    <div className="flex flex-col">
                        <legend className="fieldset-legend">Withdraw</legend>
                        <div className="join">
                            <label className="input w-3/4 join-item">
                                <span className="label">Amount, RWA</span>
                                <input
                                    onChange={handleWithdrawAmount}
                                    type="number"
                                    min="0"
                                />
                            </label>
                            <button
                                onClick={handleWithdraw}
                                value={withdrawAmount}
                                className="btn btn-primary join-item"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm"/>
                                ) : (
                                    "Withdraw"
                                )}
                            </button>
                        </div>
                        <p className="label"><span>You'll get: </span>
                            <span>{withdrawAmount * Number(price)} WEI</span></p>
                    </div>
                </div>
            </div>
        </div>

    )
}
