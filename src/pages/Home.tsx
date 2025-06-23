// src/pages/Home.tsx
import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import Token from '../components/Token.tsx';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";
import Admin from "../components/Admin.tsx";
import type {FunctionalComponent} from "preact";

type Props = {
    path?: string,
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
    browserProvider: BrowserProvider | null,
}

const Home: FunctionalComponent<Props> = ({provider, wsProvider, browserProvider}: Props) => {

    return (
        <Layout>
            <div class="grid grid-flow-row grid-cols-2 gap-[10px] mx-[50px] items-center justify-center">
                <Chain provider={wsProvider}/>
                <Token provider={provider}/>
                <Admin provider={browserProvider}/>
            </div>
        </Layout>
    );
}

export default Home