
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { StoreProvider } from "./contexts/StoreContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Credits from "./pages/Credits";
import Account from "./pages/Account";
import Purchases from "./pages/Purchases";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <StoreProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/credits" element={<Credits />} />
                <Route path="/account" element={<Account />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </StoreProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
