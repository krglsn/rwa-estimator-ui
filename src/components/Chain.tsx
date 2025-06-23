import {useEffect, useState} from 'preact/hooks'
import type {WebSocketProvider} from 'ethers'
import {CONTRACT_CONFIG} from "../config/chain.ts";
import {CopyableAddress} from "./CopyAddress.tsx";
import {ethers} from "ethers";
import Pool from "../abi/Pool.json";

type Props = {
    provider: WebSocketProvider | null
}

export default function Chain({provider}: Props) {

    const [blockNumber, setBlockNumber] = useState<number | null>(null)
    const [blockTime, setBlockTime] = useState<string>("")
    const [epochId, setEpochId] = useState<number>(0)
    const [epochEndTime, setEpochEndTime] = useState<number | null>(null)

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


    }, [provider])

    // @ts-ignore
    return (
            <div className="card min-h-[250px] bg-base-100 card-border">
                <div className="card-title justify-center">
                    <div className="my-8"><br/>Chain</div>
                </div>
                <div className="card-body textarea-lg p-6 flex justify-center">
                    <div>
                        Block: {blockNumber ? blockNumber + " | " : 'loading...'}{blockTime}
                    </div>
                    <div>
                        Epoch: {epochId ? epochId + " | " : 'loading...'}
                        {epochEndTime ? new Date(epochEndTime * 1000).toISOString() : ""}
                    </div>
                    <div><CopyableAddress label={"Token"}
                                          address={CONTRACT_CONFIG.realEstateTokenAddress}></CopyableAddress></div>
                    <div><CopyableAddress label={"Pool"} address={CONTRACT_CONFIG.poolAddress}></CopyableAddress></div>
                </div>
            </div>
    )
}
