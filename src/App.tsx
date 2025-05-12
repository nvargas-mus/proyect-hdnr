import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SolicitudForm from './components/SolicitudForm';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import AdminLayout from './components/AdminLayout';
import ContratosTable from './components/ContratosTable'; 
import TarifasContrato from './components/TarifasContrato';
import AsignacionesTarifa from './components/AsignacionesTarifa';
import TransportistasTable from './components/TransportistasTable';
import CoordinadorPage from './components/CoordinadorPage';
import AsignacionTarifaPage from './components/AsignacionTarifaPage';
import NotFoundPage from './components/NotFoundPage';
import Navbar from './components/NavBar';
import { SolicitudProvider } from './context/SolicitudContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <SolicitudProvider>
      <Navbar />
      <div className="container-fluid p-0">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/crear-solicitud" element={<SolicitudForm />} />
          <Route path="/coordinador" element={<CoordinadorPage />} />
          
          {/* Rutas de administrador con el layout compartido */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
            <Route path="contratos" element={<ContratosTable />} />
            <Route path="transportistas" element={<TransportistasTable />} />
            <Route path="crear-solicitud" element={<SolicitudForm />} />
            <Route path="tarifas-contrato/:contratoId" element={<TarifasContrato />} />
            <Route path="asignaciones-tarifa/:tarifaId" element={<AsignacionesTarifa />} />
            <Route path="solicitudes" element={<CoordinadorPage />} />
            <Route path="asignar-tarifa/:tarifaId" element={<AsignacionTarifaPage />} />
          </Route>
          
          {/* Rutas de redirección */}
          <Route 
            path="/tarifas-contrato/:contratoId" 
            element={<Navigate to="/admin/tarifas-contrato/:contratoId" replace />} 
          />
          <Route 
            path="/asignaciones-tarifa/:tarifaId" 
            element={<Navigate to="/admin/asignaciones-tarifa/:tarifaId" replace />} 
          />
          <Route 
            path="/asignar-tarifa/:tarifaId" 
            element={<Navigate to="/admin/asignar-tarifa/:tarifaId" replace />} 
          />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </SolicitudProvider>
  );
};

export default App;






