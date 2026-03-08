import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Download, Eye, Edit, Search, X } from "lucide-react";
import StatusBadge from "../dashboard/StatusBadge";
import { PaginationEnhanced } from "./pagination-enhanced";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DataTableEnhancedProps {
  title: string;
  columns: string[];
  data: any[];
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  renderRowActions?: (row: any) => React.ReactNode;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableExport?: boolean;
  filterPresets?: Record<string, { label: string; value: string }[]>;
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

const COLUMN_LABELS: Record<string, string> = {
  // Identifiants
  id: "ID",
  code: "Code",
  name: "Nom",
  label: "Label",
  title: "Titre",
  full_name: "Nom complet",

  // Statuts
  status: "Statut",
  status_label: "Statut",
  active_status: "Statut",

  // Localisation / Hierarchie
  site_name: "Site",
  zone_name: "Zone",
  batiment_name: "Batiment",
  coffret_name: "Armoire",
  equipement_name: "Equipement",
  piece: "Piece",
  address: "Adresse",
  city: "Ville",
  country: "Pays",
  floor: "Etage",
  floors_count: "Nb etages",
  building: "Batiment",

  // Equipements
  type: "Type",
  type_label: "Type",
  classification: "Classification",
  modele: "Modele",
  fabricant: "Fabricant",
  serial_number: "N° serie",
  ip_address: "Adresse IP",
  vlan: "VLAN",
  direction_in_out: "Direction",
  description: "Description",

  // Ports
  port_label: "Label port",
  port_type: "Type",
  speed: "Debit",
  poe_enabled: "PoE",
  device_name: "Appareil",

  // Liaisons
  media: "Media",
  from: "De",
  to: "Vers",
  length: "Longueur",

  // Systems
  vendor: "Fabricant",
  endpoint: "Endpoint",
  monitored_scope: "Perimetre",

  // VLANs
  vlan_id: "ID VLAN",
  network: "Reseau",
  gateway: "Passerelle",

  // Maintenances
  priority_label: "Priorite",
  scheduled_date: "Date planifiee",
  technicien_name: "Technicien",

  // Change Requests
  requester_name: "Demandeur",
  intervention_date_label: "Date intervention",

  // Users
  email: "Email",
  role: "Role",
  username: "Identifiant",
  phone: "Telephone",
};

const formatColumnHeader = (col: string): string =>
  COLUMN_LABELS[col] || col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ');

export default function DataTableEnhanced({
  title,
  columns,
  data,
  onRowClick,
  onEdit,
  renderRowActions,
  enableSearch = true,
  enableFilters = true,
  enableExport = true,
  filterPresets
}: DataTableEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterColumn, setFilterColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filter
    if (filterColumn && filterValue && filterValue !== '__all__') {
      filtered = filtered.filter((row) =>
        String(row[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filtered;
  }, [data, searchTerm, filterColumn, filterValue]);

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredData);

  const handleExport = () => {
    const csvContent = [
      columns.join(","),
      ...filteredData.map(row => 
        columns.map(col => `"${String(row[col] || '')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCellContent = (value: any, column: string) => {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground">-</span>;
    }

    const stringValue = String(value);
    
    if (column.toLowerCase().includes('état') || column.toLowerCase().includes('status') || column.toLowerCase().includes('etat')) {
      const statusMapping: { [key: string]: "up" | "down" | "warn" | "maintenance" | "ok" | "actif" | "fermee" } = {
        'actif': 'actif',
        'active': 'actif', 
        'up': 'up',
        'en ligne': 'up',
        'maintenance': 'maintenance',
        'down': 'down',
        'inactif': 'down',
        'inactive': 'down',
        'hors service': 'down',
        'warn': 'warn',
        'warning': 'warn',
        'alerte': 'warn',
        'ok': 'ok',
        'fermee': 'fermee',
        'fermée': 'fermee'
      };
      
      const mappedStatus = statusMapping[stringValue.toLowerCase()] || 'ok';
      return <StatusBadge status={mappedStatus} />;
    }
    
    return <span className="text-foreground">{stringValue}</span>;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterColumn("");
    setFilterValue("");
    setShowFilters(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          {enableFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          )}
          {enableExport && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="bg-accent text-accent-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {(enableSearch || showFilters) && (
        <div className="space-y-4">
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {showFilters && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={filterColumn} onValueChange={setFilterColumn}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Colonne" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {formatColumnHeader(column)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {filterColumn && filterPresets && filterPresets[filterColumn] ? (
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Toutes les valeurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Toutes les valeurs</SelectItem>
                    {filterPresets[filterColumn].map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>{preset.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Valeur à filtrer"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="flex-1"
                  disabled={!filterColumn}
                />
              )}
              
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header">
              {columns.map((column) => (
                <TableHead key={column} className="text-primary-foreground font-medium">
                  {formatColumnHeader(column)}
                </TableHead>
              ))}
              {(onRowClick || onEdit || renderRowActions) && (
                <TableHead className="text-primary-foreground font-medium">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + ((onRowClick || onEdit || renderRowActions) ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground"
                >
                  Aucun element a afficher
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-table-row-hover border-border cursor-pointer"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="text-card-foreground">
                      {renderCellContent(row[column], column)}
                    </TableCell>
                  ))}
                  {(onRowClick || onEdit || renderRowActions) && (
                    <TableCell className="text-card-foreground">
                      <div className="flex items-center gap-2">
                        {onRowClick && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowClick(row);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {renderRowActions?.(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationEnhanced
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}