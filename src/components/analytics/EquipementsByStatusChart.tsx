import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEquipementsByStatus } from "@/hooks/api";
import { Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  active: "#059669",
  inactive: "#dc2626",
  maintenance: "#d97706",
};

export default function EquipementsByStatusChart() {
  const { data, isLoading } = useEquipementsByStatus();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Équipements par statut</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data || []} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="status" width={90} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {(data || []).map((entry: any, i: number) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
