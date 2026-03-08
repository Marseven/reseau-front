import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import Sidebar, { MobileHeader } from "@/components/layout/Sidebar";
import OfflineBanner from "@/components/layout/OfflineBanner";
import PwaUpdatePrompt from "@/components/layout/PwaUpdatePrompt";
import QrScanner from "@/components/qrcode/QrScanner";
import { Button } from "@/components/ui/button";
import { ScanLine } from "lucide-react";

export default function AppLayout() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [scannerOpen, setScannerOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { requestPermission } = useNotificationPermission();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      requestPermission();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // When navigating back to Index with a section in state
  useEffect(() => {
    const state = location.state as { section?: string } | null;
    if (state?.section && location.pathname === '/') {
      setActiveSection(state.section);
      // Clear the state so refreshing doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // If we're on a detail page, navigate back to Index
    if (location.pathname !== '/') {
      navigate('/', { state: { section } });
    }
  };

  const handleQrScan = (decodedText: string) => {
    const baieMatch = decodedText.match(/\/baie\/([^/?#]+)/);
    const equipMatch = decodedText.match(/\/equipement\/([^/?#]+)/);

    if (baieMatch) {
      navigate(`/baie/${baieMatch[1]}`);
    } else if (equipMatch) {
      navigate(`/equipement/${equipMatch[1]}`);
    } else {
      navigate(decodedText.startsWith("/") ? decodedText : `/${decodedText}`);
    }
  };

  const isIndex = location.pathname === '/';

  return (
    <>
      <div className="flex h-screen bg-background">
        {isMobile ? (
          <div className="flex flex-1 flex-col">
            <MobileHeader
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
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
                <Outlet context={{ activeSection, setActiveSection }} />
              </div>
            </main>
          </div>
        ) : (
          <>
            <Sidebar
              activeSection={isIndex ? activeSection : ''}
              onSectionChange={handleSectionChange}
            />
            <div className="flex flex-1 flex-col">
              <OfflineBanner />
              <main className="flex-1 overflow-auto">
                <div className="p-8">
                  <Outlet context={{ activeSection, setActiveSection }} />
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
    </>
  );
}
