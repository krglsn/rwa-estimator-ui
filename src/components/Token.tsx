import {ethers, type JsonRpcProvider} from "ethers";
import {useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";

type Props = {
    provider: JsonRpcProvider | null
}

export default function Chain({provider}: Props) {

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
        <div className="flex justify-center">
            <div className="card w-full min-h-max bg-base-100 card-border card-lg">
                <div className="card-title justify-center">
                    <br/>Token
                </div>
                <div className="card-body justify-center">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Choose token</legend>
                        <label className="input w-[140px]">
                            <span className="label">ID</span>
                            <input
                                type="number"
                                min={0}
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
                        <label className="input  w-[140px]">
                            <span className="label">ID</span>
                            <input
                                type="number"
                                min={0}
                                placeholder="Epoch ID"
                                value={epochId}
                                onChange={(
                                    e) => setEpochId(
                                    parseInt((e.target as HTMLInputElement).value) || 0
                                )}
                            />

                        </label>
                        <p className="label"><span>Epoch price: </span>
                            <span> {price ?? "loading..."}</span></p>
                    </fieldset>

                </div>
            </div>
        </div>

    )

}