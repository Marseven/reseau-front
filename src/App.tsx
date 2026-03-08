import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "@/lib/queryClient";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import SectionSkeleton from "./components/ui/section-skeleton";

const Index = lazy(() => import("./pages/Index"));
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
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={
                  <Suspense fallback={<SectionSkeleton />}>
                    <Index />
                  </Suspense>
                } />
                <Route path="/baie/:token" element={
                  <Suspense fallback={<SectionSkeleton />}>
                    <CoffretDetailPage />
                  </Suspense>
                } />
                <Route path="/equipement/:token" element={
                  <Suspense fallback={<SectionSkeleton />}>
                    <EquipementDetailPage />
                  </Suspense>
                } />
                <Route path="/sites/:id" element={
                  <Suspense fallback={<SectionSkeleton />}>
                    <SiteDetailPage />
                  </Suspense>
                } />
                <Route path="/zones/:id" element={
                  <Suspense fallback={<SectionSkeleton />}>
                    <ZoneDetailPage />
                  </Suspense>
                } />
                <Route path="/batiments/:id" element={
                  <Suspense fallback={<SectionSkeleton />}>
                    <BatimentDetailPage />
                  </Suspense>
                } />
                <Route path="/salles/:id" element={
                  <Suspense fallback={<SectionSkeleton />}>
                    <SalleDetailPage />
                  </Suspense>
                } />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
