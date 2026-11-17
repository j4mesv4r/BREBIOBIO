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

import CentralMando from './pages/dashboard/CentralMando';
import Inventario from './pages/dashboard/Inventario';
import GestionDirectorio from './pages/dashboard/GestionDirectorio';
import ConfiguracionSitio from './pages/dashboard/ConfiguracionSitio';
import MiPerfil from './pages/dashboard/MiPerfil';

const RutaProtegida = ({ children, rolesPermitidos, moduloRequerido }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 text-xs font-black uppercase tracking-widest text-neutral-600">
        Cargando sesión...
      </div>
    );
  }

  // 1. Si no está autenticado, redirige a Login
  if (!user) return <Navigate to="/login" replace />;

  // 2. Validación por rol institucional o permiso granular activado por Superadmin
  if (rolesPermitidos || moduloRequerido) {
    const rolSistema = (profile?.rol || '').toLowerCase();
    const cargoOng = (profile?.cargo_ong || '').toLowerCase();
    const permisosModulos = profile?.permisos_modulos || {};

    const tieneRol =
      rolesPermitidos &&
      (rolesPermitidos.includes(rolSistema) || rolesPermitidos.includes(cargoOng));

    const tieneModuloActivo =
      moduloRequerido && Boolean(permisosModulos[moduloRequerido]);

    if (!tieneRol && !tieneModuloActivo) {
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

          {/* Rutas Protegidas (Intranet Unificada) */}
          <Route
            path="/mi-perfil"
            element={
              <RutaProtegida>
                <MiPerfil />
              </RutaProtegida>
            }
          />
          <Route path="/panel" element={<Navigate to="/mi-perfil" replace />} />
          <Route
            path="/central-mando"
            element={
              <RutaProtegida
                rolesPermitidos={['director', 'superadmin']}
                moduloRequerido="central_mando"
              >
                <CentralMando />
              </RutaProtegida>
            }
          />
          <Route
            path="/inventario"
            element={
              <RutaProtegida
                rolesPermitidos={['director', 'superadmin']}
                moduloRequerido="inventario"
              >
                <Inventario />
              </RutaProtegida>
            }
          />
          <Route
            path="/gestion"
            element={
              <RutaProtegida
                rolesPermitidos={['director', 'superadmin']}
                moduloRequerido="gestion"
              >
                <GestionDirectorio />
              </RutaProtegida>
            }
          />
          <Route
            path="/configuracion"
            element={
              <RutaProtegida rolesPermitidos={['superadmin']}>
                <ConfiguracionSitio />
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