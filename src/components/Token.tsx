import {ethers, type JsonRpcProvider} from "ethers";
import {useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";

type Props = {
    provider: JsonRpcProvider | null
}

export default function Chain({ provider }: Props) {

    const [tokenId, setTokenId] = useState<number>(0)
    const [epochId, setEpochId] = useState<number>(0)
    const [supply, setSupply] = useState<number | null>(null)
    const [price, setPrice] = useState<number | null>(null)

    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, provider);

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
                setPrice(price)
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

        <div className="widget">
            <h2 className="widget-title">Token</h2>
            <div className="field">
                <span className="label">Choose token id:</span>
                <input
                    type="number"
                    min={0}
                    className="input input-bordered w-16"
                    placeholder="Token ID"
                    value={tokenId}
                    onChange={(
                        e) => setTokenId(
                        parseInt((e.target as HTMLInputElement).value) || 0
                    )}
                />
            </div>
            <div className="field">
                <span className="label">Total supply:</span>
                <span
                    className="value"> {supply ?? "loading..."}</span>
            </div>
            <div className="field">
                <span className="label">Choose epoch id:</span>
                <input
                    type="number"
                    min={0}
                    className="input input-bordered w-16"
                    placeholder="Epoch ID"
                    value={epochId}
                    onChange={(
                        e) => setEpochId(
                        parseInt((e.target as HTMLInputElement).value) || 0
                    )}
                />
            </div>
            <div className="field">
                <span className="label">Epoch price:</span>
                <span
                    className="value">{price ?? "loading..."}</span>
            </div>
        </div>

    )

}