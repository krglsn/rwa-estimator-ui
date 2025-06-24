import {type BrowserProvider, type JsonRpcProvider, type WebSocketProvider} from "ethers";
import {useWallet} from "../lib/useWallet.ts";
import {useEffect, useState} from "preact/hooks";
import {ethers} from "ethers";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import Pool from "../abi/Pool.json";

type Props = {
    browserProvider: BrowserProvider | null
    provider: JsonRpcProvider | null
    wsProvider: WebSocketProvider | null
}

export default function Claim({provider, browserProvider}: Props) {

    const {account,} = useWallet();
    const [claimable, setClaimable] = useState<number>(0);
    const pool = new ethers.Contract(CONTRACT_CONFIG.poolAddress, Pool.abi, provider);

    useEffect(() => {
            async function updateClaimable() {
                try {
                    const res: number = await pool.canClaimAppraiser(account)
                    setClaimable(res);
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        console.error("Error calling contract:", e.message);
                    } else {
                        console.error("Unknown error:", e);
                    }
                }

            }
            updateClaimable();
        }, [account]
    )


    return (
        <div className="flex justify-center">
            <div className="card bg-base-100 w-100 card-border card-md shadow-md justify-center p-6">
                <div className="card-title justify-center">
                    <span>Claim</span>
                </div>
                <div className="card-body justify-center">
                    Claimable: {claimable}
                </div>
            </div>
        </div>

    )
}
