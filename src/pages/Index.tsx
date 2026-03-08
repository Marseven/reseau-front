import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import Sidebar, { MobileHeader } from "@/components/layout/Sidebar";
import OfflineBanner from "@/components/layout/OfflineBanner";
import PwaUpdatePrompt from "@/components/layout/PwaUpdatePrompt";
import QrScanner from "@/components/qrcode/QrScanner";
import SectionSkeleton from "@/components/ui/section-skeleton";
import { Button } from "@/components/ui/button";
import { ScanLine } from "lucide-react";

const DashboardOverview = lazy(() => import("@/components/dashboard/DashboardOverview"));
const ArmoiresSection = lazy(() => import("@/components/sections/ArmoiresSection"));
const EquipmentsSection = lazy(() => import("@/components/sections/EquipmentsSection"));
const LiaisonsSection = lazy(() => import("@/components/sections/LiaisonsSection"));
const PortsSection = lazy(() => import("@/components/sections/PortsSection"));
const MaintenanceSection = lazy(() => import("@/components/sections/MaintenanceSection"));
const ParametresSection = lazy(() => import("@/components/sections/ParametresSection"));
const UsersSection = lazy(() => import("@/components/sections/UsersSection"));
const SitesSection = lazy(() => import("@/components/sections/SitesSection"));
const ZonesSection = lazy(() => import("@/components/sections/ZonesSection"));
const BatimentsSection = lazy(() => import("@/components/sections/BatimentsSection"));
const SallesSection = lazy(() => import("@/components/sections/SallesSection"));
const VlansSection = lazy(() => import("@/components/sections/VlansSection"));
const CartographieSection = lazy(() => import("@/components/sections/CartographieSection"));
const NotificationsSection = lazy(() => import("@/components/sections/NotificationsSection"));
const ProfileSection = lazy(() => import("@/components/sections/ProfileSection"));
const ChangeRequestsSection = lazy(() => import("@/components/sections/ChangeRequestsSection"));
const RapportsSection = lazy(() => import("@/components/sections/RapportsSection"));
const AnalyticsSection = lazy(() => import("@/components/sections/AnalyticsSection"));

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [scannerOpen, setScannerOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { requestPermission } = useNotificationPermission();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Request notification permission once on first load after auth
  useEffect(() => {
    if (isAuthenticated) {
      requestPermission();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) {
    return null;
  }

  const handleQrScan = (decodedText: string) => {
    // Try to extract a path from the QR content
    const baieMatch = decodedText.match(/\/baie\/([^/?#]+)/);
    const equipMatch = decodedText.match(/\/equipement\/([^/?#]+)/);

    if (baieMatch) {
      navigate(`/baie/${baieMatch[1]}`);
    } else if (equipMatch) {
      navigate(`/equipement/${equipMatch[1]}`);
    } else {
      // If not a recognized URL pattern, try direct navigation
      navigate(decodedText.startsWith("/") ? decodedText : `/${decodedText}`);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "sites":
        return <SitesSection />;
      case "zones":
        return <ZonesSection />;
      case "batiments":
        return <BatimentsSection />;
      case "salles":
        return <SallesSection />;
      case "armoires":
        return <ArmoiresSection />;
      case "equipements":
        return <EquipmentsSection />;
      case "liaisons":
        return <LiaisonsSection />;
      case "ports":
        return <PortsSection />;
      case "maintenance":
        return <MaintenanceSection />;
      case "change-requests":
        return <ChangeRequestsSection />;
      case "parametres":
        return <ParametresSection />;
      case "users":
        return <UsersSection />;
      case "vlans":
        return <VlansSection />;
      case "cartographie":
        return <CartographieSection />;
      case "notifications":
        return <NotificationsSection />;
      case "rapports":
        return <RapportsSection />;
      case "analytics":
        return <AnalyticsSection />;
      case "profil":
        return <ProfileSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="flex h-screen bg-background">
        {isMobile ? (
          <div className="flex flex-1 flex-col">
            <MobileHeader
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              rightSlot={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setScannerOpen(true)}
                >
                  <ScanLine className="h-5 w-5" />
                </Button>
              }
            />
            <OfflineBanner />
            <main className="flex-1 overflow-auto">
              <div className="p-4">
                <Suspense fallback={<SectionSkeleton />}>
                  {renderContent()}
                </Suspense>
              </div>
            </main>
          </div>
        ) : (
          <>
            <Sidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
            <div className="flex flex-1 flex-col">
              <OfflineBanner />
              <main className="flex-1 overflow-auto">
                <div className="p-8">
                  <Suspense fallback={<SectionSkeleton />}>
                    {renderContent()}
                  </Suspense>
                </div>
              </main>
            </div>
          </>
        )}

        {/* Desktop floating QR scan button */}
        {!isMobile && (
          <Button
            className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg"
            size="icon"
            onClick={() => setScannerOpen(true)}
          >
            <ScanLine className="h-5 w-5" />
          </Button>
        )}
      </div>

      <QrScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleQrScan}
      />
      <PwaUpdatePrompt />
    </TooltipProvider>
  );
};

export default Index;
