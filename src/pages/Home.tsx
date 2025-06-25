import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import Token from '../components/Token.tsx';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";
import Admin from "../components/Admin.tsx";
import type {FunctionalComponent} from "preact";
import Rent from "../components/Rent.tsx";

type Props = {
    path?: string,
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
    browserProvider: BrowserProvider | null,
}

const Home: FunctionalComponent<Props> = ({provider, wsProvider, browserProvider}: Props) => {

    return (
        <Layout>
            <div class="grid grid-flow-row grid-cols-2 gap-6 items-center justify-center p-6">
                <Chain provider={wsProvider}/>
                <Token provider={provider} browserProvider={browserProvider}/>
                <Admin provider={browserProvider}/>
                <Rent provider={provider} browserProvider={browserProvider}/>
            </div>
        </Layout>
    );
}

export default Home