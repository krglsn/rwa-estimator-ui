import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import type {FunctionalComponent} from 'preact';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";
import Appraise from "../components/Appraise.tsx";
import Claim from "../components/Claim.tsx";
import Token from "../components/Token.tsx";
import PriceEpochChart from "../components/Chart.tsx";

type Props = {
    path?: string,
    browserProvider: BrowserProvider | null,
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
}

const Appraiser: FunctionalComponent<Props> = ({wsProvider, browserProvider, provider}: Props) => {

    return (
        <Layout provider={provider}>
            <div className="grid grid-cols-11 gap-2 p-2">
                <div className="col-span-4 flex flex-col gap-2">
                    <Chain provider={wsProvider}/>
                    <Token provider={provider}/>
                </div>
                <div className="col-span-5 flex flex-col gap-2">
                    <Appraise browserProvider={browserProvider} provider={provider} wsProvider={wsProvider}/>
                    <PriceEpochChart provider={provider}/>
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                    <Claim browserProvider={browserProvider} provider={provider} wsProvider={wsProvider}/>
                </div>
            </div>
        </Layout>
    );
}

export default Appraiser