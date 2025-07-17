import { createRoot } from 'react-dom/client'
import './index.css'
import './assets/styles/common.scss'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import './i18n.js'
import { NotificationProvider } from './contexts/NotificationContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </BrowserRouter>,
)
