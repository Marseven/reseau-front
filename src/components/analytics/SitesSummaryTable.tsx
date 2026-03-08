import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSitesSummary } from "@/hooks/api";
import { Loader2 } from "lucide-react";

export default function SitesSummaryTable() {
  const { data, isLoading } = useSitesSummary();

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Résumé par site</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead className="text-center">Zones</TableHead>
                  <TableHead className="text-center">Coffrets</TableHead>
                  <TableHead className="text-center">Équipements</TableHead>
                  <TableHead className="text-center">Maintenances actives</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data || []).map((site: any) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      {site.name}
                      <span className="ml-1 text-xs text-muted-foreground">({site.code})</span>
                    </TableCell>
                    <TableCell className="text-center">{site.zones_count}</TableCell>
                    <TableCell className="text-center">{site.coffrets_count}</TableCell>
                    <TableCell className="text-center">{site.equipements_count}</TableCell>
                    <TableCell className="text-center">
                      {site.maintenance_active_count > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          {site.maintenance_active_count}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      Aucun site
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
