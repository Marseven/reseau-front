import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SectionSkeleton from "./components/ui/section-skeleton";

const CoffretDetailPage = lazy(() => import("./pages/CoffretDetailPage"));
const EquipementDetailPage = lazy(() => import("./pages/EquipementDetailPage"));
const SiteDetailPage = lazy(() => import("./pages/SiteDetailPage"));
const ZoneDetailPage = lazy(() => import("./pages/ZoneDetailPage"));
const BatimentDetailPage = lazy(() => import("./pages/BatimentDetailPage"));
const SalleDetailPage = lazy(() => import("./pages/SalleDetailPage"));

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/baie/:token" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8"><SectionSkeleton /></div>}>
                    <CoffretDetailPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/equipement/:token" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8"><SectionSkeleton /></div>}>
                    <EquipementDetailPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/sites/:id" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8"><SectionSkeleton /></div>}>
                    <SiteDetailPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/zones/:id" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8"><SectionSkeleton /></div>}>
                    <ZoneDetailPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/batiments/:id" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8"><SectionSkeleton /></div>}>
                    <BatimentDetailPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/salles/:id" element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8"><SectionSkeleton /></div>}>
                    <SalleDetailPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
