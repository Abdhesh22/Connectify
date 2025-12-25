import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/index.css'
import "./axios.config"
import { createRoot } from 'react-dom/client';
import Routes from './routes';
import { StoreProvider } from "./components/provider/store.provider";
import { Toaster } from "react-hot-toast";
import AuthenticateHandler from "./AuthenticateHandler";

createRoot(document.getElementById('root')!).render(
  <StoreProvider>
    <AuthenticateHandler>
      <Toaster position="top-right" />
      <Routes />
    </AuthenticateHandler>
  </StoreProvider>
);