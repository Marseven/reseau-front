import { useAuth } from "@/contexts/AuthContext";

export function useRole() {
  const { user } = useAuth();
  const role = user?.role ?? '';
  const isSuperAdmin = role === 'superadmin';
  return {
    role,
    isAdmin: isSuperAdmin || role === 'administrator',
    isDirecteur: role === 'directeur',
    isPrestataire: role === 'prestataire',
    canWrite: isSuperAdmin || ['administrator', 'directeur'].includes(role),
    canManageUsers: isSuperAdmin || role === 'administrator',
    canPropose: isSuperAdmin || ['administrator', 'directeur', 'technicien'].includes(role),
    canReadOnly: !isSuperAdmin && ['user', 'prestataire'].includes(role),
  };
}
