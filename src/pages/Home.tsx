// src/pages/Home.tsx
import Layout from '../layout';

export default function Home() {
  const account = '0x9c81a0ae0cdf...';

  return (
    <Layout account={account}>
      <div class="grid grid-cols-2 gap-6 p-6">
        <div class="bg-white shadow-xl rounded-xl p-8">
          <h2 class="text-xl font-bold text-center">Chain</h2>
          <p>Block: 8582283</p>
          <p>Token: 0xabc...</p>
          <p>Pool: 0xdef...</p>
        </div>

        <div class="bg-white shadow-xl rounded-xl p-8">
          <h2 class="text-xl font-bold text-center">Token</h2>
          <input type="number" className="input input-bordered w-full" placeholder="Token ID"/>
          <p>Total supply: 100</p>
        </div>
      </div>
    </Layout>
  );
}
