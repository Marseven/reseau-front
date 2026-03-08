import { lazy, Suspense } from "react";
import { useOutletContext } from "react-router-dom";
import SectionSkeleton from "@/components/ui/section-skeleton";

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
  const { activeSection } = useOutletContext<{ activeSection: string; setActiveSection: (s: string) => void }>();

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
    <Suspense fallback={<SectionSkeleton />}>
      {renderContent()}
    </Suspense>
  );
};

export default Index;
