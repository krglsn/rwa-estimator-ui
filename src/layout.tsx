import type {FunctionalComponent} from 'preact';
import {useWallet} from './lib/useWallet';

interface LayoutProps {
    children: preact.ComponentChildren;
}

const Layout: FunctionalComponent<LayoutProps> = ({children}) => {
    const {account, connect} = useWallet()
    return (<div>
        {/* Header */}
        <div className="max-w-96/100">
            <div className="navbar bg-base-100">
            <div className="navbar-start">
                <a className="btn btn-ghost btn-xl text-xl no-underline" href="/">RWA Estimator</a>
            </div>
            <div className="navbar-center lg:flex">
                <ul className="menu menu-horizontal textarea-lg">
                    <li><a className="no-underline text-inherit" href="/admin">Admin</a></li>
                    <li><a className="no-underline text-inherit">Appraiser</a></li>
                    <li><a className="no-underline text-inherit">Depositor</a></li>
                </ul>
            </div>
            <div className="navbar-end">
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
        <main>
            {children}
        </main>
    </div>);
};

export default Layout;