import {type BrowserProvider, ethers, type JsonRpcProvider, type WebSocketProvider, ZeroAddress} from "ethers";
import {useWallet} from "../lib/useWallet.ts";
import {useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateToken from "../abi/RealEstateToken.json";
import Pool from "../abi/Pool.json";

type Props = {
    browserProvider: BrowserProvider | null
    provider: JsonRpcProvider | null
    wsProvider: WebSocketProvider | null
}

export default function Claim({provider, browserProvider}: Props) {

    const {account,} = useWallet();
    const [tokenId, setTokenId] = useState<number>(0)
    const [claimable, setClaimable] = useState<number>(0);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, provider);

    useEffect(() => {
            async function updateClaimable() {
                if (tokenId !== null && account) {
                    const poolAddress = await token.getPool(tokenId)
                    console.log("Pool address: ", poolAddress)
                    if (poolAddress !== ZeroAddress) {
                        try {
                            const pool = new ethers.Contract(poolAddress, Pool.abi, provider)
                            const res: number = await pool.canClaimAppraiser(account)
                            setClaimable(res);
                        } catch (e: unknown) {
                            if (e instanceof Error) {
                                console.error("Error calling contract:", e.message);
                            } else {
                                console.error("Unknown error:", e);
                            }
                        }
                    } else {
                        setClaimable(0)
                    }
                } else {
                    setClaimable(0)
                }


            }

            updateClaimable();
        }, [account, tokenId]
    )


    return (
        <div className="flex justify-center">
            <div className="card bg-base-100 w-100 card-border card-md shadow-md justify-center p-6">
                <div className="card-title justify-center">
                    <span>Claim</span>
                </div>
                <div className="card-body justify-center">
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
                    Claimable: {claimable}
                </div>
            </div>
        </div>

    )
}
