import {render} from 'preact'
import './index.css'
import {App} from './app.tsx'
import {NotificationProvider} from "./context/NotificationContext.tsx";
import {TokenProvider} from "./context/TokenContext.tsx";

render(
    <TokenProvider>
        <NotificationProvider>
            <App/>
        </NotificationProvider>
    </TokenProvider>
    , document.getElementById('app')!);
