import {type BrowserProvider, ethers, type JsonRpcProvider, type WebSocketProvider} from "ethers";
import {useEffect, useState} from "preact/hooks";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";
import {useWallet} from "../lib/useWallet.ts";

type Props = {
    browserProvider: BrowserProvider | null
    provider: JsonRpcProvider | null
    wsProvider: WebSocketProvider | null
}

export default function Appraise({provider}: Props) {

    const [isAppraiser, setIsAppraiser] = useState<boolean>(false)

    const {account,} = useWallet()

    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, provider);

    useEffect(() => {

        async function updateStatus() {
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

        updateStatus();

    }, [account])

    return (
        <div className="flex justify-center">
            <div className="card w-full min-h-max bg-base-100 card-border card-lg">
                <div className="card-title justify-center">
                    <br/>Appraisal
                    <div
                        className={`status ${isAppraiser ? 'status-success' : 'status-error'} animate-ping`}
                    />
                </div>
                <div className="card-body justify-center">
                    LGTM
                </div>
            </div>
        </div>

    )

}