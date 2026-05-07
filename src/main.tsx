import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import { SecurityProvider } from "./contexts/SecurityContext";
import { WalletProvider } from "./contexts/WalletProvider";
import { AuthProvider } from "./contexts/AuthProvider";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SecurityProvider>
            <WalletProvider>
              <App />
            </WalletProvider>
          </SecurityProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Add console log to confirm app mounted
console.log('🚀 Sield app mounted successfully');
