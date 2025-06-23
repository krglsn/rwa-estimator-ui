// src/pages/Home.tsx
import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import type {FunctionalComponent} from 'preact';
import type {WebSocketProvider} from "ethers";

type Props = {
    path?: string,
    wsProvider: WebSocketProvider | null,
}

const Appraiser: FunctionalComponent<Props> = ({wsProvider}: Props) => {

    return (
        <Layout>
            <div class="grid grid-flow-row grid-cols-2 gap-[10px] mx-[50px] items-center justify-center">
                <Chain provider={wsProvider ?? null}/>
            </div>
        </Layout>
    );
}

export default Appraiser