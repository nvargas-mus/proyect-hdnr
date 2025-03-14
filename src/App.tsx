import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SolicitudForm from './components/SolicitudForm';
import HomePage from './components/HomePage';
import CoordinadorPage from './components/CoordinadorPage';
import AdminPage from './components/AdminPage';
import NotFoundPage from './components/NotFoundPage';
import Navbar from './components/NavBar';
import { SolicitudProvider } from './context/SolicitudContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <SolicitudProvider>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/crear-solicitud" element={<SolicitudForm />} />
          <Route path="/coordinador" element={<CoordinadorPage />} /> 
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </SolicitudProvider>
  );
};

export default App;






