import {useEffect, useState} from 'preact/hooks'
import type {WebSocketProvider} from 'ethers'
import {ethers} from "ethers";
import {CONTRACT_CONFIG} from "../config/chain.ts";
import {CopyableAddress} from "./CopyAddress.tsx";
import Pool from "../abi/Pool.json";

type Props = {
    provider: WebSocketProvider | null
}

type TokenPlan = {
    rentAmount: number,
    epochDuration: number,
    programEnd: number
}

export default function Chain({provider}: Props) {

    const [blockNumber, setBlockNumber] = useState<number | null>(null)
    const [blockTime, setBlockTime] = useState<string>("")
    const [epochId, setEpochId] = useState<number>(0)
    const [epochEndTime, setEpochEndTime] = useState<number | null>(null)
    const [plan, setPlan] = useState<TokenPlan | null>(null)

    const pool = new ethers.Contract(CONTRACT_CONFIG.poolAddress, Pool.abi, provider)

    useEffect(() => {
        if (provider) {
            async function updateBlockNumber(bn: number) {
                setBlockNumber(bn);
                // @ts-ignore
                const blockData = await provider.getBlock(bn);
                const timestamp = blockData ? blockData.timestamp : 0;
                setBlockTime(new Date(timestamp * 1000).toISOString());
            }

            provider.on('block', updateBlockNumber)

            return () => {
                provider.off('block', updateBlockNumber)
            }
        } else {
            console.warn("No provider");
        }
    }, [provider])

    useEffect(() => {

        async function updateEpoch() {
            try {
                const [epoch, endTime]: [number, number] = await pool.getEpoch();
                setEpochEndTime(Number(endTime));
                setEpochId(epoch)
                console.log("Epoch: %s, %s", epoch, endTime)
                const plan: TokenPlan = await pool.getPlan()
                console.log("Plan: ", plan)
                setPlan(plan)
            } catch (e: unknown) {
                if (e instanceof Error) {
                    console.error("Error calling contract:", e.message);
                } else {
                    console.error("Unknown error:", e);
                }
            }
        }

        if (provider) {
            updateEpoch();
        } else {
            console.warn("No provider");
        }


    }, [provider, blockNumber])

    // @ts-ignore
    return (
        <div className="flex justify-center">
            <div className="card w-150 bg-base-100 card-border card-md shadow-md justify-center p-4">
                <div className="card-title justify-center">
                    Chain
                </div>
                <div className="card-body flex justify-center">
                    <div>
                        Block: {blockNumber ? blockNumber + " | " : 'loading...'}{blockTime}
                    </div>
                    <div>
                        Epoch: {epochId !== null ? epochId + " | " : 'loading... | '}
                        {epochEndTime ? new Date(epochEndTime * 1000).toISOString() : ""}
                    </div>
                    <div>
                        Rent: {plan ? `${plan.rentAmount} | Epoch duration: ${plan.epochDuration} | Program end: ${new Date(Number(plan.programEnd) * 1000).toISOString()}` : 'loading...'}
                    </div>
                    <div><CopyableAddress label={"Token"}
                                          address={CONTRACT_CONFIG.realEstateTokenAddress}></CopyableAddress></div>
                    <div><CopyableAddress label={"Pool"} address={CONTRACT_CONFIG.poolAddress}></CopyableAddress></div>
                </div>
            </div>
        </div>


    )
}
