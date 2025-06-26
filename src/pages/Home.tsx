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
        <div className="grid grid-cols-11 gap-2 p-2">
            <div className="col-span-4 flex flex-col gap-2">
                <Chain provider={wsProvider}/>
                <Token provider={provider}/>
            </div>
            <div className="col-span-5 flex flex-col gap-2">
                <Admin browserProvider={browserProvider}/>
            </div>
            <div className="col-span-2 flex flex-col gap-2">
                <Rent provider={provider} browserProvider={browserProvider}/>
            </div>
        </div>
    </Layout>
);

}

export default Home