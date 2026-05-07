import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AccessControl from "./pages/AccessControl";
import AuditLog from "./pages/AuditLog";
import DocumentViewer from "./pages/DocumentViewer";
import Viewer from "./pages/Viewer";
import WalletConnect from "./pages/WalletConnect";
import ChooseAction from "./pages/ChooseAction";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Initialize mock data
import { initMockStore } from "./lib/mockServices";
initMockStore();

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/wallet-connect" element={<WalletConnect />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/choose-action" element={<ChooseAction />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/access-control"
        element={
          <ProtectedRoute>
            <AccessControl />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-log"
        element={
          <ProtectedRoute>
            <AuditLog />
          </ProtectedRoute>
        }
      />
      <Route path="/viewer" element={<Viewer />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;


