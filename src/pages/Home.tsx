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
        <Layout provider={provider}>
            <div class="grid grid-flow-row grid-cols-2 gap-6 justify-center p-6">
                <div className="flex flex-col justify-center w-150 gap-2">
                    <Chain provider={wsProvider}/>
                    <Token provider={provider} />
                </div>
                <div className="flex flex-col w-150 gap-2">
                    <Admin browserProvider={browserProvider}/>
                    <Rent provider={provider} browserProvider={browserProvider}/>
                </div>
            </div>
        </Layout>
    );
}

export default Home