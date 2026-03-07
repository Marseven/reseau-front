import { useAuth } from "@/contexts/AuthContext";

export function useRole() {
  const { user } = useAuth();
  const role = user?.role ?? '';
  return {
    role,
    isAdmin: role === 'administrator',
    isDirecteur: role === 'directeur',
    canWrite: ['administrator', 'directeur'].includes(role),
    canManageUsers: role === 'administrator',
    canPropose: ['administrator', 'directeur', 'technicien'].includes(role),
  };
}
