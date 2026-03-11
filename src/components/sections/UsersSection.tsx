import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import QueryWrapper from "@/components/ui/query-wrapper";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import DetailsModal from "@/components/ui/details-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddUserForm from "@/components/forms/AddUserForm";
import { useUsers, useDeleteUser } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";
import { LogOut, Settings, Trash2, Pencil } from "lucide-react";

const UsersSection = () => {
  const { user, logout } = useAuth();
  const { canManageUsers } = useRole();
  const [params] = useState({ per_page: 50 });
  const { data: paginatedUsers, isLoading, isError, error } = useUsers(params);
  const deleteUser = useDeleteUser();

  const users = paginatedUsers?.data || [];

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    deleteUser.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "Utilisateur désactivé", description: "L'utilisateur a été désactivé avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la désactivation", variant: "destructive" }),
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrator': return 'bg-red-100 text-red-800';
      case 'directeur': return 'bg-purple-100 text-purple-800';
      case 'technicien': return 'bg-blue-100 text-blue-800';
      case 'prestataire': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrator': return 'Administrateur';
      case 'directeur': return 'Directeur';
      case 'technicien': return 'Technicien';
      case 'prestataire': return 'Prestataire';
      default: return 'Utilisateur';
    }
  };

  const tableData = users.map((u: any) => ({
    ...u,
    full_name: `${u.name || ''} ${u.surname || ''}`.trim(),
    site_name: u.site?.name || '-',
    active_status: u.is_active ? 'active' : 'inactive',
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <div className="flex gap-2">
          {canManageUsers && <AddUserForm />}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </div>

      {/* Current User Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Mon profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className={getRoleBadgeColor(user?.role || 'user')}>
                {getRoleLabel(user?.role || 'user')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${users.length} utilisateurs`}
          columns={["full_name", "email", "role", "site_name", "active_status"]}
          data={tableData}
          onRowClick={handleRowClick}
          renderRowActions={canManageUsers ? (row: any) => (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Modifier"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
                className="text-destructive hover:text-destructive"
                title="Désactiver"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : undefined}
        />
      </QueryWrapper>

      <DetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Détails de l'utilisateur"
        data={selectedItem}
        onEdit={canManageUsers ? () => {
          setIsDetailsOpen(false);
          setEditItem(selectedItem);
          setIsEditOpen(true);
        } : undefined}
      />

      {editItem && (
        <AddUserForm
          initialData={editItem}
          open={isEditOpen}
          onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Désactiver l'utilisateur"
        description={`Êtes-vous sûr de vouloir désactiver l'utilisateur "${selectedItem?.full_name || selectedItem?.name}" ? Le compte sera désactivé mais conservé.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
};

export default UsersSection;
