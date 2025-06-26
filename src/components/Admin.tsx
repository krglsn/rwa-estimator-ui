import {useContext, useEffect, useRef, useState} from 'preact/hooks'
import {type BrowserProvider, ethers, getAddress} from 'ethers'
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";
import {useWallet} from "../lib/useWallet.ts";
import {NotificationContext} from "../context/NotificationContext.tsx";
import {useToken} from "../context/TokenContext.tsx";

type Props = {
    browserProvider: BrowserProvider | null
}

export default function Admin({browserProvider}: Props) {

    const {selectedTokenId, currentEpochId} = useToken();
    const [loading, setLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    console.log("Current epoch: ", currentEpochId);
    const [epochId, setEpochId] = useState<number>(0);
    const [oraclePrice, setOraclePrice] = useState<number>(0)
    const [price, setPrice] = useState<number | null>(null)
    const [appraisals, setAppraisals] = useState<number>(0)
    const {account,} = useWallet()
    const {show} = useContext(NotificationContext);
    const addressRef = useRef<HTMLInputElement>(null);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, browserProvider);

    async function sendOraclePrice(e: Event) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const amount = parseInt((form.elements.namedItem("oraclePrice") as HTMLInputElement).value);
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, signer);
            const tx = await token.setOraclePrice(selectedTokenId, epochId, amount);
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                show({
                    message: 'Transaction confirmed! ' + tx.hash,
                    type: 'success',
                });
                setPrice(await token.getEpochPrice(selectedTokenId, epochId))
                setOraclePrice(await token.getOraclePrice(selectedTokenId, epochId))
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
        if (currentEpochId !== undefined && currentEpochId !== null) {
            setEpochId(currentEpochId);
        }
    }, [currentEpochId]);


    useEffect(() => {

        async function updateEpochPrice(selectedTokenId: number, epochId: number) {
            try {
                const price = await token.getEpochPrice(selectedTokenId, epochId);
                const appraisals = await token.getAppraisalCount(selectedTokenId, epochId);
                const oraclePrice = await token.getOraclePrice(selectedTokenId, epochId);
                setPrice(price)
                setAppraisals(appraisals)
                setOraclePrice(oraclePrice)
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error("Error calling contract:", e.message);
                } else {
                    console.error("Unknown error:", e);
                }
            }
        }

        updateEpochPrice(selectedTokenId, epochId);

    }, [selectedTokenId, epochId])

    useEffect(() => {

        async function updateStatus() {
            if (account) {
                const owner = await token.owner();
                if (owner.toLowerCase() === account.toLowerCase()) {
                    setIsOwner(true)
                } else {
                    setIsOwner(false)
                }
            }
        }

        updateStatus();
    }, [account])

    useEffect(() => {

        async function updateStatus() {
            if (account) {
                const owner = await token.owner();
                if (owner.toLowerCase() === account.toLowerCase()) {
                    setIsOwner(true)
                } else {
                    setIsOwner(false)
                }
            }
        }

        updateStatus();
    }, [account])

    const handleAddAppraiser = async (appraiser: string) => {
        try {
            if (browserProvider) {
                const signer = await browserProvider.getSigner();
                const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, signer)
                const address = getAddress(appraiser)
                const tx = await token.registerAppraiser(address)
                const receipt = await tx.wait()
                console.log("Receipt: ", receipt)
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

            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Error calling contract:", e.message);
                show({
                    message: 'Transaction error! ' + e.message,
                    type: 'error'
                });
            } else {
                console.error("Unknown error:", e);
            }
        }
    };

    const handleClick = async () => {
        const value = addressRef.current?.value;
        if (value) {
            setLoading(true);
            try {
                await handleAddAppraiser(value);
            } catch (err) {
                console.error("Transaction failed:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex justify-center">
            <div className="card bg-base-100 card-border shadow-md p-4 w-full">
                <div className="card-title justify-center">
                    <span>Admin</span>
                    <span
                        className={`status ${isOwner ? 'status-success' : 'status-error animate-ping'}`}
                    />
                </div>
                <div className="card-body justify-center">

                    <fieldset>
                        <form onSubmit={sendOraclePrice}>
                            <legend className="fieldset-legend">Override oracle price</legend>
                            <div className="flex flex-row justify-left gap-2">
                                <div className="flex flex-col">
                                    <label className="input w-40">
                                        <span className="label">Epoch ID</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            name="epochId"
                                            placeholder="Epoch ID"
                                            value={epochId}
                                            onChange={(
                                                e) => setEpochId(
                                                parseInt((e.target as HTMLInputElement).value) || 0
                                            )}
                                        />
                                    </label>
                                    <p className="label mt-2">
                                        <span>
                                            Oracle price:
                                        </span>
                                        <span>
                                            {oraclePrice ?? "n/a"}
                                        </span>
                                    </p>
                                    <p className="label">
                                        <span>
                                            Weighted price:
                                        </span>
                                        <span>
                                            {price ?? "n/a"}
                                        </span>
                                    </p>
                                    <p className="label">
                                        <span>
                                            Appraisals:
                                        </span>
                                        <span>
                                            {appraisals ?? "n/a"}
                                        </span>
                                    </p>
                                </div>
                                <div className="join">
                                    <label className="input join-item">
                                        <span className="label">Price</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            name="oraclePrice"
                                            placeholder="value"
                                        />
                                    </label>
                                    <button
                                        disabled={loading || !isOwner || oraclePrice > 0}
                                        className="join-item btn btn-primary w-40"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm mr-2"/>
                                                Sending tx...
                                            </>
                                        ) : (
                                            "Send tx"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </fieldset>

                    <div className="divider"></div>

                    <fieldset>
                        <legend className="fieldset-legend">Register appraiser</legend>
                        <div className="join">
                            <label className="input w-105 join-item">
                                <span className="label">Address</span>
                                <input
                                    type="string"
                                    ref={addressRef}
                                />
                            </label>
                            <button
                                onClick={handleClick}
                                disabled={loading || !isOwner}
                                className="btn btn-primary join-item w-40"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm"/>
                                ) : (
                                    "Add Appraiser"
                                )}
                            </button>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    )
}
