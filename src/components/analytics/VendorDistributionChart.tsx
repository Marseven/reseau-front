import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEquipementsByVendor } from "@/hooks/api";
import { Loader2 } from "lucide-react";

export default function VendorDistributionChart() {
  const { data, isLoading } = useEquipementsByVendor();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Top fabricants</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data || []} margin={{ left: 10 }}>
              <XAxis dataKey="fabricant" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
