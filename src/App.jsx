import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/public/Home';
import SobreNosotros from './pages/public/SobreNosotros';
import SolicitarApoyo from './pages/public/SolicitarApoyo';
import Postular from './pages/public/Postular';
import FichaVoluntarioPublica from './pages/public/FichaVoluntarioPublica';
import OperativoInvitado from './pages/public/OperativoInvitado';

import Login from './pages/auth/Login';
import RegistroPostulante from './pages/auth/RegistroPostulante';

import CentralMando from './pages/dashboard/CentralMando';
import Inventario from './pages/dashboard/Inventario';
import GestionDirectorio from './pages/dashboard/GestionDirectorio';
import ConfiguracionSitio from './pages/dashboard/ConfiguracionSitio';
import MiPerfil from './pages/dashboard/MiPerfil';
import Tesoreria from './pages/dashboard/Tesoreria';
import Auditoria from './pages/dashboard/Auditoria';
import Cursos from './pages/dashboard/Cursos';

const RutaProtegida = ({
  children,
  rolesPermitidos,
  cargosPermitidos,
  moduloRequerido,
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 text-xs font-black uppercase tracking-widest text-neutral-600">
        Cargando sesión...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (rolesPermitidos || cargosPermitidos || moduloRequerido) {
    const rolSistema = (profile?.rol || '').toLowerCase();
    const cargosUsuario = Array.isArray(profile?.cargos_operativos)
      ? profile.cargos_operativos.map((c) => c.toLowerCase())
      : [];
    const permisosModulos = profile?.permisos_modulos || {};

    const tieneRol =
      rolesPermitidos && rolesPermitidos.includes(rolSistema);

    const tieneCargo =
      cargosPermitidos &&
      cargosUsuario.some((c) => cargosPermitidos.includes(c));

    const tieneModuloActivo =
      moduloRequerido && Boolean(permisosModulos[moduloRequerido]);

    if (!tieneRol && !tieneCargo && !tieneModuloActivo) {
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

          {/* Acceso Provisorio Multi-Agencia vía Enlace o QR */}
          <Route path="/operativo-invitado/:codigo" element={<OperativoInvitado />} />

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
            path="/cursos"
            element={
              <RutaProtegida
                rolesPermitidos={['voluntario', 'director', 'superadmin']}
              >
                <Cursos />
              </RutaProtegida>
            }
          />
          <Route
            path="/central-mando"
            element={
              <RutaProtegida
                rolesPermitidos={['postulante', 'voluntario', 'director', 'superadmin']}
                cargosPermitidos={['do', 'dos', 'jc', 'lem', 'prehospitalario']}
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
                cargosPermitidos={['presidente', 'do', 'dos', 'jc', 'lem', 'logistica']}
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
                cargosPermitidos={['secretario', 'do', 'lem']}
                moduloRequerido="gestion"
              >
                <GestionDirectorio />
              </RutaProtegida>
            }
          />
          <Route
            path="/tesoreria"
            element={
              <RutaProtegida
                rolesPermitidos={['director', 'superadmin']}
                cargosPermitidos={['tesorero']}
              >
                <Tesoreria />
              </RutaProtegida>
            }
          />
          <Route
            path="/auditoria"
            element={
              <RutaProtegida rolesPermitidos={['superadmin']}>
                <Auditoria />
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