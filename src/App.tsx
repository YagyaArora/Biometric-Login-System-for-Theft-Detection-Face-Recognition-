
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import FaceVerification from "./pages/FaceVerification";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create a wrapper component to handle protected routes
const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the current route is public
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);

  // In a real app, you would check for an authentication token here
  const isAuthenticated = localStorage.getItem('authToken') !== null;

  // Redirect to login if not authenticated and not on a public route
  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please log in to continue'
        } 
      });
    }
  }, [isAuthenticated, isPublicRoute, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/face-verification" element={<FaceVerification />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
