import { Loader2, AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryWrapperProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  children: React.ReactNode;
}

function getStatusCode(error: any): number | null {
  return error?.response?.status ?? error?.status ?? null;
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
    const status = getStatusCode(error);

    if (status === 403) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Accès restreint</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Vous n'avez pas les droits nécessaires pour accéder à cette section.
            Contactez votre administrateur si vous pensez que c'est une erreur.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Erreur</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {error?.message || 'Une erreur est survenue lors du chargement des données.'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
