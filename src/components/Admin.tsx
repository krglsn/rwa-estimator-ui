import {useRef, useState} from 'preact/hooks'
import {type BrowserProvider, getAddress} from 'ethers'
import {CONTRACT_CONFIG} from "../config/chain.ts";
import {ethers} from "ethers";
import RealEstateTokenABI from "../abi/RealEstateToken.json";

type Props = {
    provider: BrowserProvider | null
}

export default function Admin({provider}: Props) {

    const [isLoading, setIsLoading] = useState(false);
    const addressRef = useRef<HTMLInputElement>(null);
    // const pool = new ethers.Contract(CONTRACT_CONFIG.poolAddress, Pool.abi, provider)

    const handleAddAppraiser = async (appraiser: string) => {
        try {
            if (provider) {
                const signer = await provider.getSigner();
                const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, signer)
                const address = getAddress(appraiser)
                const tx = await token.registerAppraiser(address)
                const receipt = await tx.wait()
                console.log("Receipt: ", receipt)
            }

        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Error calling contract:", e.message);
            } else {
                console.error("Unknown error:", e);
            }
        }
    };

    const handleClick = async () => {
        const value = addressRef.current?.value;
        if (value) {
            setIsLoading(true);
            try {
                await handleAddAppraiser(value);
            } catch (err) {
                console.error("Transaction failed:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="card min-h-[250px] bg-base-100 card-border">
            <div className="card-title justify-center">
                <div className="my-8"><br/>Admin</div>
            </div>
            <div className="card-body textarea-lg flex justify-center">
                <div>
                    <span>Add appraiser: </span>
                    <input
                        type="string"
                        ref={addressRef}
                        className="input input-bordered w-flex"
                        placeholder="Address"
                    />
                    <button
                        onClick={handleClick}
                        disabled={isLoading}
                        className="btn btn-primary"
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-sm"/>
                        ) : (
                            "Add Appraiser"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
