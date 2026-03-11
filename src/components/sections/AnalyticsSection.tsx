import EquipementsByTypeChart from "@/components/analytics/EquipementsByTypeChart";
import EquipementsByClassificationChart from "@/components/analytics/EquipementsByClassificationChart";
import EquipementsByStatusChart from "@/components/analytics/EquipementsByStatusChart";
import VendorDistributionChart from "@/components/analytics/VendorDistributionChart";
import MaintenanceTrendsChart from "@/components/analytics/MaintenanceTrendsChart";
import PortUtilizationChart from "@/components/analytics/PortUtilizationChart";
import SitesSummaryTable from "@/components/analytics/SitesSummaryTable";
import SystemsByTypeChart from "@/components/analytics/SystemsByTypeChart";
import EquipementsByCoffretChart from "@/components/analytics/EquipementsByCoffretChart";
import PortsByVlanChart from "@/components/analytics/PortsByVlanChart";

export default function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytiques</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Tableaux de bord et statistiques avancées
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <EquipementsByTypeChart />
        <EquipementsByClassificationChart />
        <EquipementsByStatusChart />
        <SystemsByTypeChart />
        <PortsByVlanChart />
        <VendorDistributionChart />
        <EquipementsByCoffretChart />
        <MaintenanceTrendsChart />
        <PortUtilizationChart />
        <SitesSummaryTable />
      </div>
    </div>
  );
}
