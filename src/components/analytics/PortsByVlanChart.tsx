import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortsByVlan } from "@/hooks/api";
import { Loader2 } from "lucide-react";

const COLORS = ["#059669", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#4f46e5", "#be185d"];

export default function PortsByVlanChart() {
  const { data, isLoading } = usePortsByVlan();

  const chartData = (data || []).map((d: any) => ({
    name: d.vlan ? `VLAN ${d.vlan}` : "Sans VLAN",
    value: d.total,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ports par VLAN</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
