import { Loader2, AlertCircle } from "lucide-react";

interface QueryWrapperProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  children: React.ReactNode;
}

export default function QueryWrapper({ isLoading, isError, error, children }: QueryWrapperProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-destructive">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>{error?.message || 'Une erreur est survenue'}</span>
      </div>
    );
  }

  return <>{children}</>;
}
