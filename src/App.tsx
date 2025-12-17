
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import Payments from "./pages/Payments";
import Categories from "./pages/Categories";
import LegalEntities from "./pages/LegalEntities";
import CustomFields from "./pages/CustomFields";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Contractors from "./pages/Contractors";
import CustomerDepartments from "./pages/CustomerDepartments";
import ApprovalsHistory from "./pages/ApprovalsHistory";
import PendingApprovals from "./pages/PendingApprovals";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard2" element={<ProtectedRoute><Dashboard2 /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute requiredPermission={{ resource: 'payments', action: 'read' }}><Payments /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute requiredPermission={{ resource: 'categories', action: 'read' }}><Categories /></ProtectedRoute>} />
            <Route path="/legal-entities" element={<ProtectedRoute requiredPermission={{ resource: 'legal_entities', action: 'read' }}><LegalEntities /></ProtectedRoute>} />
            <Route path="/custom-fields" element={<ProtectedRoute requiredPermission={{ resource: 'custom_fields', action: 'read' }}><CustomFields /></ProtectedRoute>} />
            <Route path="/contractors" element={<ProtectedRoute requiredPermission={{ resource: 'contractors', action: 'read' }}><Contractors /></ProtectedRoute>} />
            <Route path="/customer-departments" element={<ProtectedRoute requiredPermission={{ resource: 'customer_departments', action: 'read' }}><CustomerDepartments /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requiredPermission={{ resource: 'users', action: 'read' }}><Users /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute requiredPermission={{ resource: 'roles', action: 'read' }}><Roles /></ProtectedRoute>} />
            <Route path="/approvals-history" element={<ProtectedRoute requiredPermission={{ resource: 'payments', action: 'read' }}><ApprovalsHistory /></ProtectedRoute>} />
            <Route path="/pending-approvals" element={<ProtectedRoute requiredPermission={{ resource: 'payments', action: 'read' }}><PendingApprovals /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute requiredPermission={{ resource: 'services', action: 'read' }}><Services /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;