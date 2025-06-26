import {type BrowserProvider, ethers, type JsonRpcProvider, type WebSocketProvider} from "ethers";
import {useContext, useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";
import {useWallet} from "../lib/useWallet.ts";
import {NotificationContext} from '../context/NotificationContext.tsx';
import {useToken} from "../context/TokenContext.tsx";

type Props = {
    browserProvider: BrowserProvider | null
    provider: JsonRpcProvider | null
    wsProvider: WebSocketProvider | null
}

export default function Appraise({provider, browserProvider}: Props) {

    const {selectedTokenId, currentEpochId} = useToken();
    const [isAppraiser, setIsAppraiser] = useState<boolean>(false)
    const [loading, setLoading] = useState(false);
    const [epochId, setEpochId] = useState<number>(0);
    const {account,} = useWallet()
    const [oraclePrice, setOraclePrice] = useState<number>(0)
    const [price, setPrice] = useState<number | null>(null)
    const [appraisals, setAppraisals] = useState<number>(0)
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, provider);
    const {show} = useContext(NotificationContext);


    useEffect(() => {
        if (currentEpochId !== undefined && currentEpochId !== null) {
            setEpochId(currentEpochId);
        }
    }, [currentEpochId, selectedTokenId]);


    useEffect(() => {

        async function updateStatus() {
            if (!account) {
                setIsAppraiser(false);
            } else {
                try {
                    console.log("Is appraiser: ", account, await token.getAddress())
                    const isAppraiser = await token.isAppraiser(account);
                    setIsAppraiser(isAppraiser)
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        console.error("Error calling contract:", e.message);
                    } else {
                        console.error("Unknown error:", e);
                    }
                }
            }

        }

        updateStatus();
    }, [account, currentEpochId, selectedTokenId])

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

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const eId = (form.elements.namedItem("epochId") as HTMLInputElement).value;
        const amount = (form.elements.namedItem("appraisal") as HTMLInputElement).value;
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, signer);
            const tx = await token.setAppraiserPrice(selectedTokenId, eId, amount);
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
            const price = await token.getEpochPrice(selectedTokenId, epochId)
            const appraisals = await token.getAppraisalCount(selectedTokenId, epochId)
            const oraclePrice = await token.getOraclePrice(selectedTokenId, epochId)
            setPrice(price)
            setAppraisals(appraisals)
            setOraclePrice(oraclePrice)
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
            <div className="card bg-base-100 card-border card-md shadow-md justify-center p-6">
                <div className="card-title justify-center">
                    <span>Appraisal</span>
                    <span
                        className={`status ${isAppraiser ? 'status-success' : 'status-error animate-ping'}`}
                    />
                </div>
                <div className="card-body justify-center">

                    <fieldset>
                        <form onSubmit={handleSubmit}>
                            <legend className="fieldset-legend">Send appraisal for epoch</legend>
                            <div className="flex flex-row justify-left gap-2">
                                <div className="flex flex-col">
                                    <label className="input w-full">
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
                                            name="appraisal"
                                            placeholder="value"
                                        />
                                    </label>
                                    <button
                                        disabled={loading || !isAppraiser}
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
                </div>
            </div>
        </div>
    )
}