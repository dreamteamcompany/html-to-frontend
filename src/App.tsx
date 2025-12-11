
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Payments from "./pages/Payments";
import Categories from "./pages/Categories";
import LegalEntities from "./pages/LegalEntities";
import CustomFields from "./pages/CustomFields";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Contractors from "./pages/Contractors";
import CustomerDepartments from "./pages/CustomerDepartments";
import ApprovalsHistory from "./pages/ApprovalsHistory";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/legal-entities" element={<ProtectedRoute><LegalEntities /></ProtectedRoute>} />
            <Route path="/custom-fields" element={<ProtectedRoute><CustomFields /></ProtectedRoute>} />
            <Route path="/contractors" element={<ProtectedRoute><Contractors /></ProtectedRoute>} />
            <Route path="/customer-departments" element={<ProtectedRoute><CustomerDepartments /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
            <Route path="/approvals-history" element={<ProtectedRoute><ApprovalsHistory /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;