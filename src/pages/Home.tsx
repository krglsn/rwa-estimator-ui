// src/pages/Home.tsx
import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import Token from '../components/Token.tsx';
import type {Provider} from "ethers";

type Props = {
    provider: Provider | null
}

export default function Home( { provider }: Props) {

  return (
    <Layout>
      <div class="grid grid-cols-2 gap-6 p-6">
        <Chain provider={provider} />
        <Token />
      </div>
    </Layout>
  );
}
