import type {FunctionalComponent} from 'preact';
import {useWallet} from './lib/useWallet';
import {useToken} from "./context/TokenContext.tsx";

interface LayoutProps {
    children: preact.ComponentChildren;
}

const Layout: FunctionalComponent<LayoutProps> = ({children}) => {
    const {account, connect} = useWallet()
    const path = window.location.pathname;
  const { selectedTokenId, setSelectedTokenId} = useToken();

    return (<div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="navbar bg-base-100">
            <div className="navbar-start">
                <div className="w-40 rounded-full">
                    <a href="/">
                        <img
                            alt="RWA Estimator Logo"
                            src="src/assets/logo4.png"/>
                    </a>
                </div>
            </div>
            <div className="navbar-center">
                <ul className="menu menu-horizontal text-lg">
                    <li><a className={path === "/" ? "btn btn-soft" : ""} href="/">Admin</a></li>
                    <li><a className={path === "/appraiser" ? "btn btn-soft" : ""} href="/appraiser">Appraiser</a></li>
                    <li><a className={path === "/depositor" ? "btn btn-soft" : ""} href="/depositor">Depositor</a></li>
                </ul>
            </div>
            <div className="navbar-end p-6">
                <div className="flex mx-8 gap-2">
                    <div className="flex justify-center">
                        <select
                            defaultValue="0"
                            value={selectedTokenId}
                            className="select"
                            onChange={(e) => setSelectedTokenId(
                                parseInt((e.target as HTMLInputElement).value) || 0
                            )}
                        >
                            <option disabled={true}>Choose Token ID</option>
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                        </select>
                    </div>
                </div>
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
        <div className="divider divider-neutral m-0 p-0"></div>
        {/* Main */}
        <main className="bg-base-200/30 flex-grow">
            {children}
        </main>
    </div>);
};

export default Layout;