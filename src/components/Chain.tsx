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

    return (
        <div className="widget">
            <h2 className="widget-title">Chain</h2>
            <div className="field">
                <span className="label">Block: </span>
                <span
                    className="value">{blockNumber ? blockNumber + "|" : 'loading...'}{blockTime}</span>
            </div>
            <div className="field">
                <span className="label">Epoch: </span>
                <span
                    className="value">
                    {epochId ? epochId + "|" : 'loading...'}
                    {new Date(epochEndTime * 1000).toISOString()}
                </span>
            </div>
            <CopyableAddress label={"Token"} address={CONTRACT_CONFIG.realEstateTokenAddress}></CopyableAddress>
            <CopyableAddress label={"Pool"} address={CONTRACT_CONFIG.poolAddress}></CopyableAddress>
        </div>
    )
}
