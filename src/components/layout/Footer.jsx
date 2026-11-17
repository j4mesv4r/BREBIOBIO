import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  ShieldCheck,
  Instagram,
  Facebook,
  Video,
  Lock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Footer() {
  const [redes, setRedes] = useState({
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
  });

  useEffect(() => {
    let mounted = true;

    const cargarConfiguracion = async () => {
      const { data, error } = await supabase
        .from('configuracion_sitio')
        .select('instagram_url, facebook_url, tiktok_url')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data && mounted) {
        setRedes({
          instagram_url: data.instagram_url?.trim() || '',
          facebook_url: data.facebook_url?.trim() || '',
          tiktok_url: data.tiktok_url?.trim() || '',
        });
      }
    };

    cargarConfiguracion();
    return () => {
      mounted = false;
    };
  }, []);

  const tieneRedes = Boolean(
    redes.instagram_url || redes.facebook_url || redes.tiktok_url
  );

  return (
    <footer className="relative bg-gradient-to-b from-[#121418] via-[#0A0A0A] to-[#050507] text-white border-t-4 border-[#D90429] shadow-[inset_0_6px_20px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* Resplandor rojo difuminado en la base (como el pendón oficial) */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#D90429]/25 via-[#D90429]/5 to-transparent pointer-events-none" />

      {/* Silueta vectorial de Cordillera Roja y Bosques en el pie */}
      <svg
        className="absolute bottom-0 left-0 w-full h-36 text-[#D90429]/20 pointer-events-none"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,256L120,192L240,240L400,128L560,224L720,96L900,210L1080,120L1260,220L1440,160L1440,320L0,320Z" />
      </svg>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-12 relative z-10">

        {/* Bloque Superior estilo Pendón: Cápsula biselada brebiobio.cl + Redes Dinámicas */}
        <div className="mb-14 rounded-3xl bg-gradient-to-b from-[#1C1F26] to-[#0E1014] p-6 sm:p-8 ring-1 ring-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.12),inset_0_-4px_10px_rgba(0,0,0,0.8),0_20px_45px_-10px_rgba(0,0,0,0.7)] flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-[#F01436] via-[#D90429] to-[#9E001A] px-6 py-3 shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-4px_8px_rgba(0,0,0,0.5),0_10px_25px_-4px_rgba(217,4,41,0.55)]">
              <Globe size={22} className="text-white shrink-0" strokeWidth={2.5} />
              <span className="text-lg sm:text-xl font-black tracking-wide text-white">
                brebiobio.cl
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F2B632]">
                Canal Oficial de Información
              </p>
              <p className="text-xs font-bold text-neutral-300 mt-0.5">
                Búsqueda, Rescate y Protección Civil · Región del Biobío
              </p>
            </div>
          </div>

          {/* Redes Sociales Dinámicas: SOLO se renderizan si el Superadmin ingresó links */}
          {tieneRedes && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-neutral-300 mr-1">
                Síguenos en nuestras plataformas digitales:
              </span>
              {redes.instagram_url && (
                <a
                  href={redes.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram oficial"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-white to-neutral-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#0A0A0A] shadow-[inset_0_2px_3px_rgba(255,255,255,1),inset_0_-3px_6px_rgba(0,0,0,0.2),0_8px_20px_-4px_rgba(0,0,0,0.5)] hover:from-[#FFD25A] hover:to-[#F2B632] hover:-translate-y-0.5 transition-all"
                >
                  <Instagram size={16} strokeWidth={2.5} />
                  <span>Instagram</span>
                </a>
              )}
              {redes.facebook_url && (
                <a
                  href={redes.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook oficial"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-white to-neutral-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#0A0A0A] shadow-[inset_0_2px_3px_rgba(255,255,255,1),inset_0_-3px_6px_rgba(0,0,0,0.2),0_8px_20px_-4px_rgba(0,0,0,0.5)] hover:from-[#FFD25A] hover:to-[#F2B632] hover:-translate-y-0.5 transition-all"
                >
                  <Facebook size={16} strokeWidth={2.5} />
                  <span>Facebook</span>
                </a>
              )}
              {redes.tiktok_url && (
                <a
                  href={redes.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok oficial"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-white to-neutral-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#0A0A0A] shadow-[inset_0_2px_3px_rgba(255,255,255,1),inset_0_-3px_6px_rgba(0,0,0,0.2),0_8px_20px_-4px_rgba(0,0,0,0.5)] hover:from-[#FFD25A] hover:to-[#F2B632] hover:-translate-y-0.5 transition-all"
                >
                  <Video size={16} strokeWidth={2.5} />
                  <span>TikTok</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Grilla Principal del Footer */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Columna 1: Escudo con tamaño fijo 56x56px */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] shrink-0 overflow-hidden rounded-full bg-white p-1 shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-3px_6px_rgba(0,0,0,0.25),0_8px_20px_rgba(0,0,0,0.5)] flex items-center justify-center">
                <img
                  src="/logo-bre.png"
                  alt="O.N.G. BRE BÍO-BÍO"
                  width={48}
                  height={48}
                  className="w-12 h-12 max-w-[48px] max-h-[48px] object-contain block"
                />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-white">
                  ONG BRE <span className="text-[#F2B632]">BÍO-BÍO</span>
                </h4>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#D90429]">
                  Servicio y Vocación
                </p>
              </div>
            </div>
            <p className="text-xs font-bold leading-relaxed text-neutral-300">
              Organización No Gubernamental de Prevención, Desarrollo y Protección Civil. Preparados para responder, comprometidos con la vida.
            </p>
          </div>

          {/* Columna 2: Navegación Corta */}
          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#F2B632]">
              Navegación
            </h5>
            <ul className="space-y-2.5 text-xs font-extrabold uppercase tracking-wider text-neutral-300">
              <li>
                <Link to="/" className="transition-colors hover:text-[#F2B632]">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="transition-colors hover:text-[#F2B632]">
                  Institución
                </Link>
              </li>
              <li>
                <Link to="/apoyo" className="transition-colors hover:text-[#F2B632]">
                  Apoyo
                </Link>
              </li>
              <li>
                <Link to="/postular" className="transition-colors hover:text-[#F2B632]">
                  Postular
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Marco Legal e Intranet */}
          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#F2B632]">
              Acceso Interno
            </h5>
            <ul className="space-y-2.5 text-xs font-extrabold uppercase tracking-wider text-neutral-300">
              <li>
                <Link to="/login" className="inline-flex items-center gap-2 transition-colors hover:text-[#F2B632]">
                  <Lock size={14} className="text-[#F2B632]" strokeWidth={2.5} />
                  <span>Ingresar</span>
                </Link>
              </li>
              <li>
                <Link to="/registro" className="transition-colors hover:text-[#F2B632]">
                  Registrarse
                </Link>
              </li>
              <li className="flex items-center gap-2 pt-2 text-xs font-black text-white">
                <ShieldCheck size={16} className="shrink-0 text-[#D90429]" strokeWidth={2.5} />
                <span>Ley N° 20.500 · Título XXXIII</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Jurisdicción */}
          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#F2B632]">
              Jurisdicción
            </h5>
            <div className="space-y-3 text-xs font-bold text-neutral-300">
              <p className="flex items-start gap-2.5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#D90429]" strokeWidth={2.5} />
                <span>
                  Región del Biobío, Chile.
                  <br />
                  <span className="text-neutral-400">
                    Despliegue operativo a nivel nacional.
                  </span>
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* Cierre Idéntico al Pendón Oficial */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-white">
            ONG BRE BÍO-BÍO <span className="text-[#F2B632] mx-2">·</span> SERVICIO Y VOCACIÓN
          </p>
          <p className="text-xs font-bold text-neutral-400">
            © {new Date().getFullYear()} O.N.G. BRE BIO BIO · Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}