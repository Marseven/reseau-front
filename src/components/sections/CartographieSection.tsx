import { useState } from "react";
import { ChevronRight, ChevronDown, MapPin, Building2, Layers, DoorOpen, Server, Cpu, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSites, useZones, useBatiments, useSalles, useCoffrets, useEquipements } from "@/hooks/api";

function StatusBadge({ status }: { status: string }) {
  const variant = status === "active" ? "default" : status === "maintenance" ? "secondary" : "outline";
  return <Badge variant={variant} className="text-xs">{status}</Badge>;
}

function TreeNode({
  icon: Icon,
  label,
  status,
  count,
  children,
  defaultOpen = false,
}: {
  icon: any;
  label: string;
  status?: string;
  count?: number;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!children;

  return (
    <div className="ml-2">
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer select-none"
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          open ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <span className="w-4" />
        )}
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium">{label}</span>
        {status && <StatusBadge status={status} />}
        {count !== undefined && (
          <span className="text-xs text-muted-foreground ml-auto">({count})</span>
        )}
      </div>
      {open && hasChildren && (
        <div className="ml-4 border-l border-border pl-2">
          {children}
        </div>
      )}
    </div>
  );
}

export default function CartographieSection() {
  const { data: paginatedSites, isLoading: loadingSites } = useSites({ per_page: 100 });
  const { data: paginatedZones, isLoading: loadingZones } = useZones({ per_page: 200 });
  const { data: paginatedBatiments, isLoading: loadingBatiments } = useBatiments({ per_page: 200 });
  const { data: paginatedSalles, isLoading: loadingSalles } = useSalles({ per_page: 200 });
  const { data: paginatedCoffrets, isLoading: loadingCoffrets } = useCoffrets({ per_page: 200 });
  const { data: paginatedEquipements, isLoading: loadingEquipements } = useEquipements({ per_page: 500 });

  const sites = paginatedSites?.data || [];
  const zones = paginatedZones?.data || [];
  const batiments = paginatedBatiments?.data || [];
  const salles = paginatedSalles?.data || [];
  const coffrets = paginatedCoffrets?.data || [];
  const equipements = paginatedEquipements?.data || [];

  const isLoading = loadingSites || loadingZones || loadingBatiments || loadingSalles || loadingCoffrets || loadingEquipements;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cartographie LAN</h2>
          <div className="text-sm text-muted-foreground mt-1">Vue arborescente de l'infrastructure</div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Chargement de la topologie...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Cartographie LAN</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Vue arborescente de l'infrastructure : Site &rarr; Zone &rarr; Bâtiment &rarr; Salle &rarr; Armoire &rarr; Équipement
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-card">
        {sites.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">Aucun site trouvé</p>
        ) : (
          sites.map((site: any) => {
            const siteZones = zones.filter((z: any) => z.site_id === site.id);
            return (
              <TreeNode
                key={site.id}
                icon={MapPin}
                label={`${site.name} (${site.code})`}
                status={site.status}
                count={siteZones.length}
                defaultOpen={true}
              >
                {siteZones.map((zone: any) => {
                  const zoneBatiments = batiments.filter((b: any) => b.zone_id === zone.id);
                  const zoneCoffrets = coffrets.filter((c: any) => c.zone_id === zone.id && !c.salle_id);
                  return (
                    <TreeNode
                      key={zone.id}
                      icon={Layers}
                      label={`${zone.name} (${zone.code})`}
                      status={zone.status}
                      count={zoneBatiments.length + zoneCoffrets.length}
                    >
                      {zoneBatiments.map((bat: any) => {
                        const batSalles = salles.filter((s: any) => s.batiment_id === bat.id);
                        return (
                          <TreeNode
                            key={bat.id}
                            icon={Building2}
                            label={`${bat.name} (${bat.code})`}
                            status={bat.status}
                            count={batSalles.length}
                          >
                            {batSalles.map((salle: any) => {
                              const salleCoffrets = coffrets.filter((c: any) => c.salle_id === salle.id);
                              return (
                                <TreeNode
                                  key={salle.id}
                                  icon={DoorOpen}
                                  label={`${salle.name} (${salle.code})`}
                                  status={salle.status}
                                  count={salleCoffrets.length}
                                >
                                  {salleCoffrets.map((coffret: any) => {
                                    const coffretEquipements = equipements.filter((e: any) => e.coffret_id === coffret.id);
                                    return (
                                      <TreeNode
                                        key={coffret.id}
                                        icon={Server}
                                        label={`${coffret.name} (${coffret.code})`}
                                        status={coffret.status}
                                        count={coffretEquipements.length}
                                      >
                                        {coffretEquipements.map((eq: any) => (
                                          <TreeNode
                                            key={eq.id}
                                            icon={Cpu}
                                            label={`${eq.name} (${eq.equipement_code})`}
                                            status={eq.status}
                                          />
                                        ))}
                                      </TreeNode>
                                    );
                                  })}
                                </TreeNode>
                              );
                            })}
                          </TreeNode>
                        );
                      })}
                      {/* Coffrets directly in zone (no salle) */}
                      {zoneCoffrets.map((coffret: any) => {
                        const coffretEquipements = equipements.filter((e: any) => e.coffret_id === coffret.id);
                        return (
                          <TreeNode
                            key={coffret.id}
                            icon={Server}
                            label={`${coffret.name} (${coffret.code})`}
                            status={coffret.status}
                            count={coffretEquipements.length}
                          >
                            {coffretEquipements.map((eq: any) => (
                              <TreeNode
                                key={eq.id}
                                icon={Cpu}
                                label={`${eq.name} (${eq.equipement_code})`}
                                status={eq.status}
                              />
                            ))}
                          </TreeNode>
                        );
                      })}
                    </TreeNode>
                  );
                })}
              </TreeNode>
            );
          })
        )}
      </div>
    </div>
  );
}
