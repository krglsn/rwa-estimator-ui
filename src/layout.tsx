import type {FunctionalComponent} from 'preact';
import {useWallet} from './lib/useWallet';

interface LayoutProps {
    children: preact.ComponentChildren;
}

const Layout: FunctionalComponent<LayoutProps> = ({children}) => {
    const {account, connect} = useWallet()
    return (<div className="max-w-screen overflow-clip">
        {/* Header */}
        <div className="navbar bg-base-100">
            <div className="navbar-start">
                <a className="btn btn-ghost btn-xl text-xl no-underline" href="/">RWA Estimator</a>
            </div>
            <div className="navbar-center">
                <ul className="menu menu-horizontal textarea-lg">
                    <li><a className="no-underline text-inherit" href="/">Admin</a></li>
                    <li><a className="no-underline text-inherit" href="/appraiser">Appraiser</a></li>
                    <li><a className="no-underline text-inherit">Depositor</a></li>
                </ul>
            </div>
            <div className="navbar-end p-6">
                <div className="flex gap-2">
                    {account ? (
                        <>
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </>
                    ) : (
                        <button onClick={connect} className="btn btn-sm btn-primary">
                            Connect Wallet
                        </button>
                    )}
                </div>

            </div>
        </div>
        {/* Main */}
        <main className="bg-base-200 min-h-screen">
            {children}
        </main>
    </div>);
};

export default Layout;