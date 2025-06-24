import { render } from 'preact'
import './index.css'
import { App } from './app.tsx'
import {NotificationProvider} from "./components/NotificationContext.tsx";

render(
    <NotificationProvider><App /></NotificationProvider>, document.getElementById('app')!);
