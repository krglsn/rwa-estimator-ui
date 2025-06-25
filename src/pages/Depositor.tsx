// src/pages/Home.tsx
import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import Token from '../components/Token.tsx';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";
import type {FunctionalComponent} from "preact";
import {useState} from "preact/hooks";
import Deposit from "../components/Deposit.tsx";

type Props = {
    path?: string,
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
    browserProvider: BrowserProvider | null,
}

const Depositor: FunctionalComponent<Props> = ({provider, wsProvider, browserProvider}: Props) => {

    const [tokenId, setTokenId] = useState<number>(0)

    return (
        <Layout>
            <div className="flex justify-center">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">TokenId</legend>
                    <label className="input w-30">
                        <span className="label">ID</span>
                        <input
                            type="number"
                            min={0}
                            step={1}
                            placeholder="Token ID"
                            value={tokenId}
                            onChange={(
                                e) => setTokenId(
                                parseInt((e.target as HTMLInputElement).value) || 0
                            )}
                        />
                    </label>
                </fieldset>
            </div>
            <div class="grid grid-flow-row grid-cols-2 gap-6 items-center justify-center p-6">
                <Token provider={provider} browserProvider={browserProvider} tokenId={tokenId}/>
                <Deposit provider={provider} browserProvider={browserProvider} tokenId={tokenId}/>
            </div>
        </Layout>
    );
}

export default Depositor