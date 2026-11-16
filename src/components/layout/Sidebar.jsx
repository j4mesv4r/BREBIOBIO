import { Link, useLocation } from 'react-router-dom';
import { User, MapPin, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { profile } = useAuth();
  const { pathname } = useLocation();

  const isDirectorOrAdmin =
    profile?.rol === 'director' || profile?.rol === 'superadmin';

  const links = [
    { to: '/mi-perfil', label: 'Panel Voluntario', icon: User, show: true },
    {
      to: '/central-mando',
      label: 'Central de Mando',
      icon: MapPin,
      show: isDirectorOrAdmin,
    },
    {
      to: '/inventario',
      label: 'Inventario',
      icon: Package,
      show: isDirectorOrAdmin,
    },
  ];

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 md:min-h-[calc(100vh-57px)] md:w-64 md:border-b-0 md:border-r">
      <div className="mb-4 px-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Rol: {profile?.rol || 'cargando...'}
        </p>
      </div>
      <nav className="space-y-1">
        {links
          .filter((item) => item.show)
          .map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}

