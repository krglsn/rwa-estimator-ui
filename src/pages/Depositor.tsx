import Layout from '../layout';
import Token from '../components/Token.tsx';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";
import type {FunctionalComponent} from "preact";
import Deposit from "../components/Deposit.tsx";
import Chain from "../components/Chain.tsx";
import Claim from "../components/Claim.tsx";
import PriceEpochChart from "../components/Chart.tsx";

type Props = {
    path?: string,
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
    browserProvider: BrowserProvider | null,
}

const Depositor: FunctionalComponent<Props> = ({provider, browserProvider, wsProvider}: Props) => {

    return (
        <Layout provider={provider}>
            <div className="grid grid-cols-11 gap-2 p-2">
                <div className="col-span-4 flex flex-col gap-2">
                    <Chain provider={wsProvider}/>
                    <Token provider={provider}/>
                </div>
                <div className="col-span-5 flex flex-col gap-2">
                    <Deposit provider={provider} browserProvider={browserProvider}/>
                    <PriceEpochChart provider={provider} />
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                    <Claim browserProvider={browserProvider} provider={provider} wsProvider={wsProvider}/>
                </div>
            </div>
        </Layout>
    );
}

export default Depositor