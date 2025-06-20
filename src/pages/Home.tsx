// src/pages/Home.tsx
import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import Token from '../components/Token.tsx';
import type {BrowserProvider, JsonRpcProvider, WebSocketProvider} from "ethers";

type Props = {
    provider: JsonRpcProvider | null,
    wsProvider: WebSocketProvider | null,
    browserProvider: BrowserProvider | null,
}

export default function Home( { provider, wsProvider, }: Props) {

  return (
    <Layout>
      <div class="grid grid-cols-2 gap-6 p-6">
        <Chain provider={wsProvider} />
        <Token provider={provider}/>
      </div>
    </Layout>
  );
}
