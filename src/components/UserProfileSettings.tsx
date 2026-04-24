import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const UserProfileSettings = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('user_role') === 'admin';

  const [profileData, setProfileData] = useState({
    name: '',
    email: localStorage.getItem('user_email') || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Guardando cambios…', profileData);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Configuración de perfil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualiza tus datos personales y contraseña
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-border">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label
                  htmlFor="profileImage"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm shadow-sm transition-colors hover:bg-accent"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Subir imagen
                </Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="mt-1 text-xs text-muted-foreground">PNG o JPG, máx 2MB</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Tu nombre"
                value={profileData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@empresa.com"
                value={profileData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+56 9 1234 5678"
                value={profileData.phone}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                value={profileData.currentPassword}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={profileData.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={profileData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {!isAdmin && (
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
          )}
          <Button type="submit">
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileSettings;
