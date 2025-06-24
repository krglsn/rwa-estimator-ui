import {type BrowserProvider, ethers, type JsonRpcProvider, type WebSocketProvider} from "ethers";
import {useContext, useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";
import {useWallet} from "../lib/useWallet.ts";
import {NotificationContext} from './NotificationContext.tsx';

type Props = {
    browserProvider: BrowserProvider | null
    provider: JsonRpcProvider | null
    wsProvider: WebSocketProvider | null
}

export default function Appraise({provider, browserProvider}: Props) {

    const [isAppraiser, setIsAppraiser] = useState<boolean>(false)
    const [loading, setLoading] = useState(false);
    const {account,} = useWallet()
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, provider);
    const {show} = useContext(NotificationContext);

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
    }, [account])

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const tId = (form.elements.namedItem("tokenId") as HTMLInputElement).value;
        const eId = (form.elements.namedItem("epochId") as HTMLInputElement).value;
        const amount = (form.elements.namedItem("appraisal") as HTMLInputElement).value;
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, signer);
            const tx = await token.setAppraiserPrice(tId, eId, amount);
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
            <div className="card bg-base-100 w-100 card-border card-md shadow-md justify-center p-6">
                <div className="card-title justify-center">
                    <span>Appraisal</span>
                    <span
                        className={`status ${isAppraiser ? 'status-success' : 'status-error animate-ping'}`}
                    />
                </div>
                <div className="card-body justify-center">
                    <form onSubmit={handleSubmit}>
                        <fieldset className="fieldset rounded-box">
                            <legend className="fieldset-legend">Set appraisal</legend>

                            <label className="label">Token ID</label>
                            <input type="number" name="tokenId" className="input" placeholder="id"/>

                            <label className="label">Epoch ID</label>
                            <input type="number" name="epochId" className="input" placeholder="id"/>

                            <label className="label">Appraise</label>
                            <input type="number" name="appraisal" className="input" placeholder="value"/>

                            <button type="submit" disabled={loading || !isAppraiser} className="btn btn-primary">
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm mr-2"/>
                                        Sending tx...
                                    </>
                                ) : (
                                    "Send"
                                )}
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    )
}