import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/public/Home';
import SobreNosotros from './pages/public/SobreNosotros';
import SolicitarApoyo from './pages/public/SolicitarApoyo';
import Postular from './pages/public/Postular';
import FichaVoluntarioPublica from './pages/public/FichaVoluntarioPublica';

import Login from './pages/auth/Login';
import RegistroPostulante from './pages/auth/RegistroPostulante';

import PanelVoluntario from './pages/dashboard/PanelVoluntario';
import CentralMando from './pages/dashboard/CentralMando';
import Inventario from './pages/dashboard/Inventario';
import GestionDirectorio from './pages/dashboard/GestionDirectorio';
import MiPerfil from './pages/dashboard/MiPerfil'; // Asegúrate de importar MiPerfil

const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        Cargando sesión...
      </div>
    );
  }

  // 1. Si no está logueado, a Login
  if (!user) return <Navigate to="/login" replace />;

  // 2. Lógica de validación dual (Rol de Sistema + Cargo en ONG)
  if (rolesPermitidos) {
    const rolSistema = profile?.rol?.toLowerCase() || '';
    const cargoOng = profile?.cargo_ong?.toLowerCase() || '';

    // Verifica si el array rolesPermitidos incluye su rol de sistema (ej: superadmin) 
    // o su cargo en la ONG (ej: postulante, voluntario, director)
    const tieneAcceso = rolesPermitidos.includes(rolSistema) || rolesPermitidos.includes(cargoOng);

    if (!tieneAcceso) {
      // Si no tiene acceso, lo mandamos a su perfil básico para que no quede en pantalla en blanco
      return <Navigate to="/mi-perfil" replace />;
    }
  }

  return children;
};

const PublicLayout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Portal Público */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/nosotros" element={<PublicLayout><SobreNosotros /></PublicLayout>} />
          <Route path="/apoyo" element={<PublicLayout><SolicitarApoyo /></PublicLayout>} />
          <Route path="/postular" element={<PublicLayout><Postular /></PublicLayout>} />
          <Route path="/voluntario/:rut" element={<PublicLayout><FichaVoluntarioPublica /></PublicLayout>} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroPostulante />} />

          {/* Rutas Protegidas (Dashboard) */}
          <Route
            path="/mi-perfil"
            element={
              <RutaProtegida>
                <MiPerfil />
              </RutaProtegida>
            }
          />
          <Route
            path="/panel"
            element={
              <RutaProtegida rolesPermitidos={['postulante', 'voluntario', 'director', 'superadmin']}>
                <PanelVoluntario />
              </RutaProtegida>
            }
          />
          <Route
            path="/central-mando"
            element={
              <RutaProtegida rolesPermitidos={['director', 'superadmin']}>
                <CentralMando />
              </RutaProtegida>
            }
          />
          <Route
            path="/inventario"
            element={
              <RutaProtegida rolesPermitidos={['director', 'superadmin']}>
                <Inventario />
              </RutaProtegida>
            }
          />
          <Route
            path="/gestion"
            element={
              <RutaProtegida rolesPermitidos={['director', 'superadmin']}>
                <GestionDirectorio />
              </RutaProtegida>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}