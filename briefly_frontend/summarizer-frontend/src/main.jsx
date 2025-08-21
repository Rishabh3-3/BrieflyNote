import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";
import {Toaster} from "sonner";
import LoginPage from "./pages/LoginPage";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* 🔔 Toaster renders toast messages */}
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  </React.StrictMode>
);