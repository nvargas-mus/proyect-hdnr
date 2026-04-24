import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-lg ring-1 ring-border">
          <Construction className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight">Página no encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          La sección que buscas aún está en construcción o no existe. Vuelve al inicio para
          seguir navegando.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
