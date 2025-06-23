// src/pages/Home.tsx
import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import Token from '../components/Token.tsx';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";
import Admin from "../components/Admin.tsx";

type Props = {
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
    browserProvider: BrowserProvider | null,
}

export default function Home({provider, wsProvider, browserProvider}: Props) {

    return (
        <Layout>
            <div class="grid grid-cols-2 gap-x-4">
                <Chain provider={wsProvider}/>
                <Token provider={provider}/>
                <Admin provider={browserProvider}/>
            </div>
        </Layout>
    );
}
