import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    User,
    Users,
    MapPin,
    Package,
    Settings,
    Home,
    LogOut,
    Shield,
    ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({
    children,
    title,
    subtitle,
    actions,
    fullHeight = false,
}) {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const [hovered, setHovered] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const rol = (profile?.rol || 'postulante').toLowerCase();
    const esSuperadmin = rol === 'superadmin';
    const esDirector = rol === 'director' || esSuperadmin;
    const permisos = profile?.permisos_modulos || {};

    const navItems = [
        {
            label: 'Mi Ficha y Certificados',
            to: '/mi-perfil',
            icon: User,
            visible: true,
            accent: 'from-[#F01436] to-[#A3001B]',
        },
        {
            label: 'Gestión Directorio',
            to: '/gestion',
            icon: Users,
            visible: esDirector || Boolean(permisos.gestion),
            accent: 'from-[#F01436] to-[#A3001B]',
        },
        {
            label: 'Central de Mando',
            to: '/central-mando',
            icon: MapPin,
            visible: esDirector || Boolean(permisos.central_mando),
            accent: 'from-[#F01436] to-[#A3001B]',
        },
        {
            label: 'Inventario y Logística',
            to: '/inventario',
            icon: Package,
            visible: esDirector || Boolean(permisos.inventario),
            accent: 'from-[#F01436] to-[#A3001B]',
        },
        {
            label: 'Configuración Sitio',
            to: '/configuracion',
            icon: Settings,
            visible: esSuperadmin,
            accent: 'from-[#FFD25A] to-[#D99B16]',
        },
    ].filter((item) => item.visible);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex min-h-screen bg-neutral-100 font-sans text-neutral-950">
            {/* ===================================================================
          DESKTOP: Riel lateral 3D que se expande al pasar el cursor (Hover)
         =================================================================== */}
            <aside
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="relative z-40 hidden shrink-0 lg:block lg:w-20"
            >
                <div
                    className={`fixed inset-y-0 left-0 flex flex-col border-r border-neutral-800 bg-[#0A0A0A] text-white transition-all duration-300 ease-out ${hovered
                            ? 'w-72 shadow-[16px_0_45px_rgba(0,0,0,0.55)]'
                            : 'w-20 shadow-xl'
                        }`}
                >
                    {/* Emblema Institucional */}
                    <div className="flex h-20 items-center border-b border-neutral-800 px-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white p-1 shadow-[0_6px_15px_rgba(0,0,0,0.5)]">
                            <img
                                src="/logo-bre.png"
                                alt="BRE Bío-Bío"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <div
                            className={`ml-3.5 overflow-hidden whitespace-nowrap transition-all duration-300 ${hovered ? 'w-48 opacity-100' : 'w-0 opacity-0'
                                }`}
                        >
                            <p className="text-sm font-black uppercase tracking-wider text-white">
                                BRE BÍO-BÍO
                            </p>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#F2B632]">
                                Sistema Interno
                            </p>
                        </div>
                    </div>

                    {/* Tarjeta de Identidad del Operador */}
                    <div className="border-b border-neutral-800 p-3.5">
                        <div className="flex items-center rounded-2xl border border-neutral-800 bg-neutral-900/90 p-2 shadow-inner">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#FFD25A] to-[#F2B632] text-[#0A0A0A] shadow-md">
                                <Shield size={19} strokeWidth={2.6} />
                            </div>
                            <div
                                className={`ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${hovered ? 'w-48 opacity-100' : 'w-0 opacity-0'
                                    }`}
                            >
                                <p className="truncate text-xs font-black text-white">
                                    {profile?.nombre_completo || 'Usuario BRE'}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#F2B632]">
                                    {rol}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Módulos de Navegación con Iconos Gruesos 3D */}
                    <nav className="flex-1 space-y-2.5 overflow-y-auto px-3 py-5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.to);
                            const isAmber = item.accent.includes('FFD25A');

                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    title={!hovered ? item.label : undefined}
                                    className={`group flex items-center rounded-2xl p-2 transition-all duration-200 ${active
                                            ? 'bg-neutral-900 ring-1 ring-white/15 shadow-[0_8px_20px_-6px_rgba(217,4,41,0.45)]'
                                            : 'hover:bg-neutral-900/70'
                                        }`}
                                >
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${active
                                                ? `bg-gradient-to-b ${item.accent} ${isAmber ? 'text-[#0A0A0A]' : 'text-white'
                                                } shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_14px_rgba(0,0,0,0.45)]`
                                                : 'border border-neutral-800 bg-neutral-900 text-neutral-300 group-hover:border-neutral-700 group-hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} strokeWidth={2.5} />
                                    </div>

                                    <span
                                        className={`ml-3.5 overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all duration-300 ${hovered ? 'w-48 opacity-100' : 'w-0 opacity-0'
                                            } ${active
                                                ? 'text-white'
                                                : 'text-neutral-300 group-hover:text-white'
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Pie del Sidebar: Portal Público y Cerrar Sesión */}
                    <div className="space-y-2 border-t border-neutral-800 p-3">
                        <Link
                            to="/"
                            title={!hovered ? 'Portal Público' : undefined}
                            className="group flex items-center rounded-2xl p-2 text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-white"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 group-hover:text-white">
                                <Home size={20} strokeWidth={2.5} />
                            </div>
                            <span
                                className={`ml-3.5 overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all duration-300 ${hovered ? 'w-48 opacity-100' : 'w-0 opacity-0'
                                    }`}
                            >
                                Portal Público
                            </span>
                        </Link>

                        <button
                            type="button"
                            onClick={signOut}
                            title={!hovered ? 'Cerrar Sesión' : undefined}
                            className="group flex w-full items-center rounded-2xl p-2 text-red-400 transition-colors hover:bg-red-950/40 hover:text-red-300"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-900/40 bg-red-950/30 text-red-400 group-hover:bg-red-600 group-hover:text-white">
                                <LogOut size={20} strokeWidth={2.5} />
                            </div>
                            <span
                                className={`ml-3.5 overflow-hidden whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all duration-300 ${hovered ? 'w-48 opacity-100' : 'w-0 opacity-0'
                                    }`}
                            >
                                Cerrar Sesión
                            </span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ===================================================================
          CONTENEDOR PRINCIPAL + MENÚ DESPLEGABLE CON FLECHA EN MÓVIL
         =================================================================== */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Barra Superior Unificada */}
                <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3.5 sm:px-8">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-bre.png"
                                alt="BRE"
                                className="h-9 w-9 rounded-full border border-neutral-200 bg-white object-contain p-0.5 lg:hidden"
                            />
                            <div>
                                {title && (
                                    <h1 className="text-base font-black uppercase tracking-tight text-neutral-950 sm:text-2xl">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="hidden text-xs font-semibold text-neutral-500 sm:block">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            {actions && <div className="flex items-center gap-2">{actions}</div>}

                            {/* Botón con flecha hacia abajo para desplegar menú en celular */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen((prev) => !prev)}
                                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0A0A0A] bg-[#0A0A0A] px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-95 lg:hidden"
                            >
                                <span>Menú</span>
                                <ChevronDown
                                    size={18}
                                    strokeWidth={2.75}
                                    className={`text-[#F2B632] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Acordeón Desplegable Móvil (se abre/cierra con la flecha hacia abajo) */}
                    <div
                        className={`overflow-hidden border-t border-neutral-800 bg-[#0A0A0A] text-white transition-all duration-300 ease-out lg:hidden ${mobileMenuOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="space-y-2 p-4">
                            <div className="mb-3 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5">
                                <span className="text-xs font-black text-white">
                                    {profile?.nombre_completo || 'Usuario BRE'}
                                </span>
                                <span className="rounded bg-[#F2B632] px-2 py-0.5 text-[10px] font-black uppercase text-black">
                                    {rol}
                                </span>
                            </div>

                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.to);
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-black uppercase tracking-wider transition-colors ${active
                                                ? 'bg-[#D90429] text-white'
                                                : 'bg-neutral-900/70 text-neutral-200 hover:bg-neutral-800'
                                            }`}
                                    >
                                        <Icon size={19} strokeWidth={2.5} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 py-2.5 text-xs font-black uppercase text-neutral-200"
                                >
                                    <Home size={16} strokeWidth={2.5} /> Portal
                                </Link>
                                <button
                                    type="button"
                                    onClick={signOut}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-950/60 border border-red-800/50 py-2.5 text-xs font-black uppercase text-red-300"
                                >
                                    <LogOut size={16} strokeWidth={2.5} /> Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenido Principal del Módulo */}
                <main
                    className={
                        fullHeight
                            ? 'flex-1 overflow-hidden'
                            : 'mx-auto w-full max-w-7xl flex-1 p-4 sm:p-8'
                    }
                >
                    {children}
                </main>
            </div>
        </div>
    );
}