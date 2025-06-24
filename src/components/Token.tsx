import {type BrowserProvider, ethers, type JsonRpcProvider} from "ethers";
import {useContext, useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";
import {NotificationContext} from "./NotificationContext.tsx";
import {useWallet} from "../lib/useWallet.ts";

type Props = {
    provider: JsonRpcProvider | null
    browserProvider: BrowserProvider | null
}

export default function Token({provider, browserProvider}: Props) {

    const [tokenId, setTokenId] = useState<number>(0)
    const [epochId, setEpochId] = useState<number>(0)
    const [supply, setSupply] = useState<number | null>(null)
    const [price, setPrice] = useState<number | null>(null)
    const [oraclePrice, setOraclePrice] = useState<number>(0)
    const [appraisals, setAppraisals] = useState<number>(0)
    const [loading, setLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const {show} = useContext(NotificationContext);

    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, provider);
    const {account,} = useWallet()

    async function sendOraclePrice(e: Event) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const amount = parseInt((form.elements.namedItem("oraclePrice") as HTMLInputElement).value);
        setLoading(true);
        try {
            // @ts-ignore
            const signer = await browserProvider.getSigner();
            const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, signer);
            const tx = await token.setOraclePrice(tokenId, epochId, amount);
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                show({
                    message: 'Transaction confirmed! ' + tx.hash,
                    type: 'success',
                });
                setPrice(await token.getEpochPrice(tokenId, epochId))
                setOraclePrice(await token.getOraclePrice(tokenId, epochId))
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

        async function updateTotalSupply(tokenId: number) {
            try {
                const supply = await token['totalSupply(uint256)'](tokenId);
                setSupply(supply)
                console.log("Supply retrieved: ", supply)
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error("Error calling contract:", e.message);
                } else {
                    console.error("Unknown error:", e);
                }
            }
        }

        updateTotalSupply(tokenId);

    }, [tokenId])

    useEffect(() => {

        async function updateEpochPrice(tokenId: number, epochId: number) {
            try {
                const price = await token.getEpochPrice(tokenId, epochId);
                const appraisals = await token.getAppraisalCount(tokenId, epochId);
                const oraclePrice = await token.getOraclePrice(tokenId, epochId);
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

        updateEpochPrice(tokenId, epochId);

    }, [tokenId, epochId])

    return (
        <div className="flex justify-center">
            <div className="card w-100 bg-base-100 card-border shadow-md p-4">
                <div className="card-title justify-center">
                    Token
                </div>
                <div className="card-body">
                    <div className="flex flex-row gap-6 justify-between">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Choose token</legend>
                            <label className="input w-30">
                                <span className="label">ID</span>
                                <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    placeholder="Token ID"
                                    value={tokenId}
                                    onChange={(
                                        e) => setTokenId(
                                        parseInt((e.target as HTMLInputElement).value) || 0
                                    )}
                                />
                            </label>
                            <p className="label"><span>Total supply: </span>
                                <span> {supply ?? "loading..."}</span></p>
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Choose epoch</legend>
                            <label className="input  w-30">
                                <span className="label">ID</span>
                                <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    placeholder="Epoch ID"
                                    value={epochId}
                                    onChange={(
                                        e) => setEpochId(
                                        parseInt((e.target as HTMLInputElement).value) || 0
                                    )}
                                />

                            </label>
                            <p className="label"><span>Oracle price: </span>
                                <span> {oraclePrice ?? "n/a"}</span></p>
                        </fieldset>
                    </div>
                    <div className="flex-row w-full">
                        <div className="stats shadow w-full">
                            <div className="stat">
                                <div className="stat-title">Token Price</div>
                                <div className="stat-value">{price ?? "n/a"}</div>
                                <div className="stat-desc">{appraisals} appraisals</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-row w-full">
                        <form onSubmit={sendOraclePrice}>
                            <legend className="fieldset-legend">Set oracle price for selection</legend>
                            <div className="join">

                                <label className="input join-item">
                                    <span className="label">Value</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        placeholder="amount"
                                        name="oraclePrice"
                                    />
                                </label>
                                <button type="submit" disabled={loading || !isOwner || oraclePrice > 0}
                                        className="join-item btn btn-primary">
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
                        </form>
                    </div>
                </div>
            </div>
        </div>

    )

}