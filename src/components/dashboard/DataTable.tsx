import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { PaginationEnhanced } from "@/components/ui/pagination-enhanced";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  title: string;
  columns: string[];
  data: any[];
  onFilter?: () => void;
  onExport?: () => void;
}

const usePagination = (data: any[], initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange
  };
};

export default function DataTable({ title, columns, data, onFilter, onExport }: DataTableProps) {
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(data);

  const isStatusColumn = (column: string) => {
    const lower = column.toLowerCase();
    return lower.includes('état') || lower.includes('status') || lower.includes('etat') || lower.includes('gravité');
  };

  const isCodeColumn = (column: string) => {
    const lower = column.toLowerCase();
    return lower === 'id' || lower === 'label' || lower === 'horodatage' || lower === 'heure';
  };

  const renderCellContent = (value: any, column: string) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-muted-foreground">—</span>;
    }

    const stringValue = String(value);

    if (isStatusColumn(column)) {
      const statusMapping: { [key: string]: "up" | "down" | "warn" | "maintenance" | "ok" | "actif" | "fermee" } = {
        'actif': 'actif', 'active': 'actif', 'up': 'up', 'en ligne': 'up',
        'maintenance': 'maintenance', 'down': 'down', 'inactif': 'down',
        'inactive': 'down', 'hors service': 'down', 'warn': 'warn',
        'warning': 'warn', 'alerte': 'warn', 'ok': 'ok', 'fermee': 'fermee',
        'fermée': 'fermee',
      };
      const mapped = statusMapping[stringValue.toLowerCase()] || 'ok';
      return <StatusBadge status={mapped} />;
    }

    if (isCodeColumn(column)) {
      return <span className="font-mono text-xs text-primary">{stringValue}</span>;
    }

    return <span className="text-foreground">{stringValue}</span>;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-1.5">
          {onFilter && (
            <Button variant="outline" size="sm" onClick={onFilter} className="h-7 text-xs border-border">
              <Filter className="h-3 w-3 mr-1.5" />
              Filtrer
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="h-7 text-xs bg-primary text-primary-foreground border-transparent hover:bg-primary/90">
              <Download className="h-3 w-3 mr-1.5" />
              Exporter
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[hsl(var(--table-header))] hover:bg-[hsl(var(--table-header))] border-b border-border">
              {columns.map((column) => (
                <TableHead key={column} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-9">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index} className="hover:bg-[hsl(var(--table-row-hover))] border-border transition-colors">
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className="text-sm py-2.5">
                    {renderCellContent(row[column], column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationEnhanced
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={data.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
