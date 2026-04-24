import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import Logo from '../assets/logo.png';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string>('');

  const updateLoginStatus = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
    setEmail(localStorage.getItem('user_email') || '');
  };

  useEffect(() => {
    updateLoginStatus();
    window.addEventListener('localStorageUpdated', updateLoginStatus);
    return () => {
      window.removeEventListener('localStorageUpdated', updateLoginStatus);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_permisos');
    setIsLoggedIn(false);
    navigate('/');
  };

  const initial = email ? email.charAt(0).toUpperCase() : 'U';
  const displayName = email.split('@')[0] || 'Usuario';

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 md:px-8">
        <button
          onClick={() => navigate(isLoggedIn ? '/home' : '/')}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="Inicio"
        >
          <img
            src={Logo}
            alt="Hidronor"
            className="h-12 w-auto object-contain dark:filter-[invert(1)_hue-rotate(180deg)_brightness(1.08)]"
          />
        </button>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {isLoggedIn && (
            <>
              <div className="hidden md:block">
                <span className="text-sm text-muted-foreground">
                  Hola, <span className="font-medium text-foreground">{displayName}</span>
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full"
                    aria-label="Abrir menú de usuario"
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initial}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px]">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground normal-case tracking-normal">
                        {displayName}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground normal-case tracking-normal">
                        {email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/configuracion')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!isLoggedIn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex"
            >
              <User className="mr-2 h-4 w-4" />
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
