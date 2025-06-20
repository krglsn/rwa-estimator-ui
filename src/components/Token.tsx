import {ethers, type JsonRpcProvider} from "ethers";
import {useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";

type Props = {
    provider: JsonRpcProvider | null
}

export default function Chain({ provider }: Props) {

    const [tokenId, setTokenId] = useState<number>(0)
    const [supply, setSupply] = useState<number | null>(null)

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

    return (
        <div className="widget">
            <h2 className="title">Token</h2>
            <input
                type="number"
                min={0}
                className="input input-bordered w-full"
                placeholder="Token ID"
                value={tokenId}
                onChange={(
                    e) => setTokenId(
                    parseInt((e.target as HTMLInputElement).value) || 0
                )}
            />
            <p>Total supply: {supply ?? "loading..."}</p>
        </div>
    )

}