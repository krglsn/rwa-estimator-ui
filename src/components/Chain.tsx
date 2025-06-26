import {useEffect, useState} from 'preact/hooks'
import {type WebSocketProvider} from 'ethers'
import {CONTRACT_CONFIG} from "../config/chain.ts";
import {CopyableAddress} from "./CopyAddress.tsx";
import {useWallet} from "../lib/useWallet.ts";

type Props = {
    provider: WebSocketProvider | null
}

export default function Chain({provider}: Props) {

    const {account,} = useWallet();
    const [blockNumber, setBlockNumber] = useState<number | null>(null)
    const [balance, setBalance] = useState<BigInt | null>(null)
    const [blockTime, setBlockTime] = useState<string>("")

    useEffect(() => {

        async function updateBalance() {
            if (account) {
                const balance = await provider?.getBalance(account) || null;
                setBalance(balance);
                console.log("Balance update: ", balance)
            }
        }

        updateBalance();

    }, [account])

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

    // @ts-ignore
    return (
        <div className="card w-full bg-base-100 card-border card-md shadow-md justify-center p-4">
            <div className="card-title justify-center">
                Chain Information
            </div>
            <div className="card-body flex justify-center">
                <div className="flex flex-col gap-4">
                    <ul className="menu w-full">
                        <li>
                            <span>Token:
                                <span className="badge justify-self-end">
                                    <CopyableAddress address={CONTRACT_CONFIG.realEstateTokenAddress}></CopyableAddress>
                                </span>
                            </span>
                        </li>
                        <li>
                            <span>Current block number:
                                <span className="badge justify-self-end">
                                    {blockNumber ? blockNumber : 'n/a'}
                                </span>
                            </span>
                        </li>
                        <li>
                            <span>Current block time:
                                <span className="badge justify-self-end">
                                    {blockTime ? blockTime : 'n/a'}
                                </span>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
