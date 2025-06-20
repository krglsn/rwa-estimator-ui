import {useEffect, useState} from 'preact/hooks'
import type {Provider} from 'ethers'
import {CONTRACT_CONFIG} from "../config/chain.ts";

type Props = {
    provider: Provider | null
}

export default function Chain({provider}: Props) {

    const [blockNumber, setBlockNumber] = useState<number | null>(null)
    const [blockTime, setBlockTime] = useState<string>("")

    // const listener = async (block: number) => {
    //   blockNumber = block;
    //   const blockData = await provider.getBlock(blockNumber);
    //   const timestamp = blockData ? blockData.timestamp : 0;
    //   blockTime = new Date(timestamp * 1000).toISOString();
    // };
    //
    // await provider.on('block', listener);


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

    return (
        <div className="widget">
            <h2 className="widget-title">Chain</h2>
            <div className="field">
                <span className="label">Block: </span>
                <span
                    className="value">{blockNumber ? blockNumber + "|" : 'loading...'}{blockTime}</span>
            </div>
            <div className="field">
                <span className="label">Token: </span>
                <span
                    className="value">{CONTRACT_CONFIG.realEstateTokenAddress}</span>
            </div>
            <div className="field">
                <span className="label">Pool: </span>
                <span
                    className="value">{CONTRACT_CONFIG.poolAddress}</span>
            </div>

        </div>)
}
