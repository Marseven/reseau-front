import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortUtilization } from "@/hooks/api";
import { Loader2 } from "lucide-react";

export default function PortUtilizationChart() {
  const { data, isLoading } = usePortUtilization();

  const chartData = data
    ? [
        { name: "Utilisés", value: data.utilization_percent, fill: "#2563eb" },
        { name: "Libres", value: 100, fill: "#e2e8f0" },
      ]
    : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Utilisation des ports</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                innerRadius="60%"
                outerRadius="90%"
                data={chartData}
                startAngle={180}
                endAngle={0}
                cx="50%"
                cy="80%"
              >
                <RadialBar dataKey="value" cornerRadius={5} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
              <span className="text-3xl font-bold">{data?.utilization_percent ?? 0}%</span>
              <span className="text-xs text-muted-foreground">
                {data?.connected ?? 0} / {data?.total ?? 0} ports
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
