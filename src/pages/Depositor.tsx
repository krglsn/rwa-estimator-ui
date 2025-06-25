import Layout from '../layout';
import Token from '../components/Token.tsx';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";
import type {FunctionalComponent} from "preact";
import Deposit from "../components/Deposit.tsx";

type Props = {
    path?: string,
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
    browserProvider: BrowserProvider | null,
}

const Depositor: FunctionalComponent<Props> = ({provider, browserProvider}: Props) => {

    return (
        <Layout>
            <div className="flex justify-center">
            </div>
            <div class="grid grid-flow-row grid-cols-2 gap-6 items-center justify-center p-6">
                <Token provider={provider} browserProvider={browserProvider}/>
                <Deposit provider={provider} browserProvider={browserProvider}/>
            </div>
        </Layout>
    );
}

export default Depositor