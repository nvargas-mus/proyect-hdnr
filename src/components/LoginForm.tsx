import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { loginUser, getUserRoles } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from './ThemeToggle';
import Logo from '../assets/logo.png';

// Credenciales de desarrollo — todos los usuarios usan la misma password.
// TODO: eliminar antes de pasar a producción.
const DEV_PASSWORD = 'Admin.dev.2026';
const DEV_USERS = [
  { email: 'admin@applogistica.dev',         label: 'Administrador' },
  { email: 'coordinador@applogistica.dev',   label: 'Coordinador Logístico' },
  { email: 'cliente@applogistica.dev',       label: 'Cliente' },
  { email: 'transportista@applogistica.dev', label: 'Transportista' },
  { email: 'ejecutivo@applogistica.dev',     label: 'Ejecutivo' },
  { email: 'aprobador@applogistica.dev',     label: 'Aprobador Financiero' },
];

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // En modo dev la contraseña está hardcoded para todos los usuarios
  const contrasena = DEV_PASSWORD;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await loginUser({ email, contrasena });

      const usuarioId = response.usuario_id || response.userId;
      const token = response.token;

      if (!usuarioId) throw new Error('No se recibió el ID del usuario en la respuesta');

      localStorage.setItem('authToken', token);
      localStorage.setItem('usuario_id', usuarioId.toString());
      localStorage.setItem('user_email', email);
      window.dispatchEvent(new Event('localStorageUpdated'));

      const roles = await getUserRoles(usuarioId);
      if (roles && roles.length > 0) {
        setMessage('Login exitoso.');
        const userRole = roles[0];
        const roleName =
          userRole.rol_id === 1
            ? 'admin'
            : userRole.rol_id === 2
              ? 'cliente'
              : userRole.rol_id === 4
                ? 'coordinador'
                : 'cliente';
        localStorage.setItem('user_role', roleName);

        if (userRole.rol_id === 1) navigate('/admin');
        else if (userRole.rol_id === 2) navigate('/home');
        else if (userRole.rol_id === 4) navigate('/coordinador');
        else navigate('/home');
      } else {
        setError('No se encontraron roles para el usuario.');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 404) setError('Usuario no encontrado');
        else if (status === 401) setError('Credenciales incorrectas');
        else setError('Error al iniciar sesión. Intenta nuevamente.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al iniciar sesión.');
      }
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Fondo decorativo con gradiente y orbes */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--color-background))]" />
      </div>

      {/* Toggle de tema */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={Logo}
            alt="Hidronor"
            className="mb-8 h-14 w-auto object-contain dark:filter-[invert(1)_hue-rotate(180deg)_brightness(1.08)]"
          />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicia sesión para acceder a tu panel
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="email">Perfil de usuario</Label>
              <Select value={email} onValueChange={setEmail}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Selecciona un perfil…
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {DEV_USERS.map((u) => (
                    <SelectItem key={u.email} value={u.email}>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.label}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Modo desarrollo — la contraseña se aplica automáticamente
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert variant="success">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando…
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
