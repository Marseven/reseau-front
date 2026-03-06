import { useState } from "react";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import DetailsModal from "@/components/ui/details-modal";
import EditModal from "@/components/ui/edit-modal";
import AddMaintenanceForm from "@/components/forms/AddMaintenanceForm";

// Maintenance uses local mock data until a backend endpoint is implemented
const mockMaintenances = [
  {
    id: 'MAINT-001',
    equipement: 'CAB-002',
    type: 'preventive',
    date: '2024-03-15',
    heure: '14:00',
    duree: '2h',
    technicien: 'Jean Dupont',
    priorite: 'moyenne',
    description: 'Maintenance préventive standard',
    statut: 'planifiee',
    dateCreation: '2024-03-10'
  },
  {
    id: 'MAINT-002',
    equipement: 'LNK-001',
    type: 'corrective',
    date: '2024-03-11',
    heure: '09:00',
    duree: '4h',
    technicien: 'Marie Martin',
    priorite: 'haute',
    description: 'Réparation liaison défaillante',
    statut: 'en-cours',
    dateCreation: '2024-03-08'
  }
];

export default function MaintenanceSection() {
  const [maintenances, setMaintenances] = useState(mockMaintenances);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleRowClick = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setIsDetailsOpen(true);
  };

  const handleEdit = (maintenance: any) => {
    setSelectedMaintenance(maintenance);
    setIsEditOpen(true);
  };

  const handleSave = (updatedMaintenance: any) => {
    setMaintenances(prev => prev.map(m => m.id === updatedMaintenance.id ? updatedMaintenance : m));
  };

  const addMaintenance = (data: any) => {
    setMaintenances(prev => [...prev, { ...data, id: `MAINT-${Date.now()}` }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion de la Maintenance</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Planification et suivi des interventions techniques
          </div>
        </div>
        <AddMaintenanceForm onAdd={addMaintenance} />
      </div>

      <DataTableEnhanced
        title={`${maintenances.length} maintenances programmées`}
        columns={["equipement", "type", "date", "heure", "technicien", "priorite", "statut"]}
        data={maintenances}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
      />

      <DetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Détails de la maintenance"
        data={selectedMaintenance}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditOpen(true);
        }}
      />

      <EditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifier la maintenance"
        data={selectedMaintenance}
        onSave={handleSave}
      />
    </div>
  );
}
