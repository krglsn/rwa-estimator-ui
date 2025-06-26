import {useEffect, useState} from 'preact/hooks'
import {ethers, type WebSocketProvider} from 'ethers'
import {CONTRACT_CONFIG} from "../config/chain.ts";
import {CopyableAddress} from "./CopyAddress.tsx";
import RealEstateToken from "../abi/RealEstateToken.json";
import {useToken} from "../context/TokenContext.tsx";

type Props = {
    provider: WebSocketProvider | null
}

export default function Chain({provider}: Props) {

    const [blockNumber, setBlockNumber] = useState<number | null>(null)
    const [blockTime, setBlockTime] = useState<string>("")
    const [tokenUri, setTokenUri] = useState<string>("")
    const [tokenMeta, setTokenMeta] = useState<string>("")
    const {selectedTokenId} = useToken();
    const token = new ethers.Contract(CONTRACT_CONFIG.realEstateTokenAddress, RealEstateToken.abi, provider);

    useEffect(() => {
            if (provider) {
                async function updateTokenInfo() {
                    let uri = await token.uri(selectedTokenId)
                    setTokenUri(uri)
                    try {
                        if (uri.startsWith('ipfs://')) {
                            const cid = uri.replace('ipfs://', '');
                            uri = `https://ipfs.io/ipfs/${cid}`;
                        }
                        const response = await fetch(uri);
                        const json = await response.text();
                        setTokenMeta(json)
                    } catch (e: unknown) {
                        console.error("Cannot retrieve json:", uri, e);
                    }


                }

                updateTokenInfo()
            }
        }
        ,
        [provider, selectedTokenId]
    )

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
        <div className="card card-xs w-full bg-base-100 card-border card-md shadow-md justify-center p-4">
            <div className="card-title justify-center">
                Chain Information
            </div>
            <div className="card-body flex justify-center">
                <div className="flex flex-col gap-4">
                    <ul className="menu w-full">
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
                        <li>
                            <span>Token:
                                <span className="badge justify-self-end">
                                    <CopyableAddress address={CONTRACT_CONFIG.realEstateTokenAddress}></CopyableAddress>
                                </span>
                            </span>
                        </li>
                        <li>
                            <span>URI:
                                {tokenMeta &&
                                  <div className="tooltip tooltip-right tooltip-secondary" data-tip={tokenMeta}>
                                    <span className="badge justify-self-end">
                                        {tokenUri ? tokenUri : 'n/a'}</span>
                                  </div>}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
