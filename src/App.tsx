import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SolicitudForm from './components/SolicitudForm';
import NotFoundPage from './components/NotFoundPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/crear-solicitud" element={<SolicitudForm />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;


