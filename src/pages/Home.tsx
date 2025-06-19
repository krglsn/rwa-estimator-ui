// src/pages/Home.tsx
import Layout from '../layout';
import Chain from '../components/Chain.tsx';
import Token from '../components/Token.tsx';

export default function Home() {
  const account = '0x9c81a0ae0cdf...';

  return (
    <Layout account={account}>
      <div class="grid grid-cols-2 gap-6 p-6">
        <Chain />
        <Token />
      </div>
    </Layout>
  );
}
