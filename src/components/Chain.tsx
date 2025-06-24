import {useEffect, useState} from 'preact/hooks'
import {type BigNumberish, formatEther, type WebSocketProvider} from 'ethers'
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
        <div className="flex justify-center">
            <div className="card w-150 bg-base-100 card-border card-md shadow-md justify-center p-4">
                <div className="card-title justify-center">
                    Chain
                </div>
                <div className="card-body flex justify-center">
                    <div>
                        Balance: {balance ? formatEther(balance as BigNumberish) : '0'}
                    </div>
                    <div>
                        Block: {blockNumber ? blockNumber + " | " : 'loading...'}{blockTime}
                    </div>
                    <div><CopyableAddress label={"Token"}
                                          address={CONTRACT_CONFIG.realEstateTokenAddress}></CopyableAddress></div>
                </div>
            </div>
        </div>


    )
}
