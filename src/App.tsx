import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FlowBuilder from "./pages/FlowBuilder";
import Leads from "./pages/Leads";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ChatWidget from "./pages/ChatWidget";
import NotFound from "./pages/NotFound";
import EmbedChat from "@/pages/EmbedChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/flow" element={<FlowBuilder />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat/:userId" element={<ChatWidget />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/embed" element={<EmbedChat />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);


export default App;
