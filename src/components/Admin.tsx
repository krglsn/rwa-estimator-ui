import {useContext, useEffect, useRef, useState} from 'preact/hooks'
import {type BrowserProvider, ethers, getAddress} from 'ethers'
import {CONTRACT_CONFIG} from "../config/chain.ts";
import RealEstateTokenABI from "../abi/RealEstateToken.json";
import {useWallet} from "../lib/useWallet.ts";
import {NotificationContext} from "../context/NotificationContext.tsx";

type Props = {
    provider: BrowserProvider | null
}

export default function Admin({provider}: Props) {

    const [isLoading, setIsLoading] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const {account,} = useWallet()
    const {show} = useContext(NotificationContext);
    const addressRef = useRef<HTMLInputElement>(null);
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, provider);

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

    const handleAddAppraiser = async (appraiser: string) => {
        try {
            if (provider) {
                const signer = await provider.getSigner();
                const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateTokenABI.abi, signer)
                const address = getAddress(appraiser)
                const tx = await token.registerAppraiser(address)
                const receipt = await tx.wait()
                console.log("Receipt: ", receipt)
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

            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Error calling contract:", e.message);
                show({
                    message: 'Transaction error! ' + e.message,
                    type: 'error'
                });
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
        <div className="flex justify-center">
            <div className="card bg-base-100 card-border shadow-md p-4 w-150">
                <div className="card-title justify-center">
                    <span>Admin</span>
                    <span
                        className={`status ${isOwner ? 'status-success' : 'status-error animate-ping'}`}
                    />
                </div>
                <div className="card-body flex justify-center">
                    <legend className="fieldset-legend">Register appraiser</legend>
                    <div className="join">
                        <label className="input w-[400px] join-item">
                            <span className="label">Address</span>
                            <input
                                type="string"
                                ref={addressRef}
                            />
                        </label>
                        <button
                            onClick={handleClick}
                            disabled={isLoading || !isOwner}
                            className="btn btn-primary join-item"
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
        </div>
    )
}
