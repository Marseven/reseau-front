import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ArmoiresSection from "@/components/sections/ArmoiresSection";
import EquipmentsSection from "@/components/sections/EquipmentsSection";
import LiaisonsSection from "@/components/sections/LiaisonsSection";
import PortsSection from "@/components/sections/PortsSection";
import MaintenanceSection from "@/components/sections/MaintenanceSection";
import ParametresSection from "@/components/sections/ParametresSection";
import UsersSection from "@/components/sections/UsersSection";
import SitesSection from "@/components/sections/SitesSection";
import ZonesSection from "@/components/sections/ZonesSection";
import BatimentsSection from "@/components/sections/BatimentsSection";
import SallesSection from "@/components/sections/SallesSection";
import VlansSection from "@/components/sections/VlansSection";
import CartographieSection from "@/components/sections/CartographieSection";
import NotificationsSection from "@/components/sections/NotificationsSection";
import ProfileSection from "@/components/sections/ProfileSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

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
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default Index;
