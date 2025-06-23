// src/pages/Home.tsx
import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import type {FunctionalComponent} from 'preact';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";
import Appraise from "../components/Appraise.tsx";

type Props = {
    path?: string,
    browserProvider: BrowserProvider | null,
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
}

const Appraiser: FunctionalComponent<Props> = ({wsProvider, browserProvider, provider}: Props) => {

    return (
        <Layout>
            <div class="grid grid-flow-row grid-cols-2 gap-[10px] mx-[50px] items-center justify-center">
                <Chain provider={wsProvider}/>
                <Appraise browserProvider={browserProvider} provider={provider} wsProvider={wsProvider}/>
            </div>
        </Layout>
    );
}

export default Appraiser