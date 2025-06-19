import type {FunctionalComponent} from 'preact';
import { useWallet } from './lib/useWallet';

interface LayoutProps {
  account?: string;
  children: preact.ComponentChildren;
}

const Layout: FunctionalComponent<LayoutProps> = ({ children }) => {
  const { account, connect } = useWallet()
  return (
    <div class="min-h-screen bg-base-200">
      {/* Header */}
      <div class="navbar bg-base-100 shadow-sm px-6 flex justify-between items-center">
        <div class="text-xl font-bold">RWA Estimator</div>
        <div class="flex gap-6">
          <a class="link link-hover" href="/admin">Admin</a>
          <a class="link link-hover" href="/appraiser">Appraiser</a>
          <a class="link link-hover" href="/depositor">Depositor</a>
        </div>
      <div>
        {account ? (
          <span className="text-sm text-gray-600">{account.slice(0, 6)}...{account.slice(-4)}</span>
        ) : (
          <button onClick={connect} className="btn btn-sm btn-primary">
            Connect Wallet
          </button>
        )}
      </div>
      </div>

      {/* Main */}
      <main class="p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;