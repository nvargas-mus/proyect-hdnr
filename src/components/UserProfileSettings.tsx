import { useState } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import '../styles/UserProfileSettings.css';

const UserProfileSettings = () => {
  const navigate = useNavigate();
  const userRoleId = Number(localStorage.getItem('rol_id'));
  const isAdmin = userRoleId === 1;

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
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
    console.log('Guardando cambios...', profileData);
  };

  const ProfileForm = (
    <Container className="user-profile-settings my-5">
      <Card className="p-4 shadow">
        <Card.Body>
          <h2 className="mb-4">Configuración de Usuario</h2>
          <Form onSubmit={handleSave}>
            {/* Imagen de Perfil */}
            <div className="d-flex justify-content-center mb-4">
              {profileData.profileImage ? (
                <img src={profileData.profileImage} alt="Perfil" className="user-profile-img" />
              ) : (
                <div className="user-profile-placeholder">Sin imagen</div>
              )}
            </div>
            <Form.Group controlId="formProfileImage" className="mb-3">
              <Form.Label>Imagen de Perfil</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
            </Form.Group>

            {/* Información del usuario */}
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                placeholder="Tu correo electrónico"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPhone">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                placeholder="Tu número de teléfono"
              />
            </Form.Group>

            {/* Cambio de contraseña */}
            <h4 className="mt-4 mb-3">Cambiar Contraseña</h4>
            <Form.Group className="mb-3" controlId="formCurrentPassword">
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={profileData.currentPassword}
                onChange={handleChange}
                placeholder="Contraseña actual"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={profileData.newPassword}
                onChange={handleChange}
                placeholder="Nueva contraseña"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirma tu nueva contraseña"
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-between buttons-wrapper">
              {/* Mostrar botón Volver solo si NO es admin */}
              {!isAdmin && (
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  ← Volver
                </Button>
              )}
              <Button type="submit" className="save-button">
                Guardar Cambios
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );

  return (
    <>
      {isAdmin ? <AdminLayout>{ProfileForm}</AdminLayout> : ProfileForm}
    </>
  );
};

export default UserProfileSettings;


