import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  ShieldCheck,
  Instagram,
  Facebook,
  Video,
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
        .single();

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
    <footer className="border-t-4 border-[#F2B632] bg-[#17191D] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-neutral-700 bg-white">
                <img
                  src="/logo-bre.png"
                  alt="O.N.G. BRE BIO BIO"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-base font-black uppercase tracking-tight text-white">
                  ONG BRE <span className="text-[#DC2626]">BIO BIO</span>
                </h4>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FACC15]">
                  Servicio y Vocación
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold leading-relaxed text-neutral-300">
              Organización No Gubernamental de Prevención, Desarrollo y
              Protección Civil. Preparados para responder, comprometidos con la
              vida.
            </p>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-widest text-[#FACC15]">
              Navegación
            </h5>
            <ul className="space-y-2.5 text-sm font-bold text-neutral-300">
              <li>
                <Link to="/" className="transition-colors hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/nosotros"
                  className="transition-colors hover:text-white"
                >
                  Institución y Estatutos
                </Link>
              </li>
              <li>
                <Link
                  to="/apoyo"
                  className="transition-colors hover:text-white"
                >
                  Solicitar Apoyo Técnico
                </Link>
              </li>
              <li>
                <Link
                  to="/postular"
                  className="transition-colors hover:text-white"
                >
                  Postular al Voluntariado
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-widest text-[#FACC15]">
              Plataforma Interna
            </h5>
            <ul className="space-y-2.5 text-sm font-bold text-neutral-300">
              <li>
                <Link
                  to="/login"
                  className="transition-colors hover:text-white"
                >
                  Intranet de Miembros
                </Link>
              </li>
              <li>
                <Link
                  to="/registro"
                  className="transition-colors hover:text-white"
                >
                  Registro de Postulantes
                </Link>
              </li>
              <li className="flex items-center gap-2 pt-2 text-xs font-extrabold text-neutral-400">
                <ShieldCheck size={16} className="shrink-0 text-[#DC2626]" />
                <span>Constituida bajo Ley N° 20.500</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-xs font-black uppercase tracking-widest text-[#FACC15]">
              Jurisdicción y Contacto
            </h5>
            <div className="space-y-3 text-sm font-bold text-neutral-300">
              <p className="flex items-start gap-2.5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#DC2626]" />
                <span>
                  Región del Biobío, Chile.
                  <br />
                  <span className="text-xs text-neutral-400">
                    Operaciones a nivel nacional.
                  </span>
                </span>
              </p>
              <p className="flex items-center gap-2.5">
                <Globe size={18} className="shrink-0 text-[#FACC15]" />
                <span className="font-black text-white">brebiobio.cl</span>
              </p>
            </div>

            {/* Redes Sociales Dinámicas: solo se renderizan si hay al menos un enlace configurado */}
            {tieneRedes && (
              <div className="mt-6 border-t border-neutral-800 pt-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-neutral-400">
                  Canales Oficiales
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {redes.instagram_url && (
                    <a
                      href={redes.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram oficial"
                      className="inline-flex items-center gap-1.5 rounded border-2 border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:border-[#DC2626] hover:bg-[#DC2626]"
                    >
                      <Instagram size={14} />
                      <span>Instagram</span>
                    </a>
                  )}
                  {redes.facebook_url && (
                    <a
                      href={redes.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook oficial"
                      className="inline-flex items-center gap-1.5 rounded border-2 border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:border-[#DC2626] hover:bg-[#DC2626]"
                    >
                      <Facebook size={14} />
                      <span>Facebook</span>
                    </a>
                  )}
                  {redes.tiktok_url && (
                    <a
                      href={redes.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok oficial"
                      className="inline-flex items-center gap-1.5 rounded border-2 border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:border-[#FACC15] hover:bg-[#FACC15] hover:text-black"
                    >
                      <Video size={14} />
                      <span>TikTok</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-6 text-xs font-bold text-neutral-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} O.N.G. BRE BIO BIO · Búsqueda, Rescate
            y Emergencia.
          </p>
          <p className="uppercase tracking-wider text-[#FACC15]">
            Región del Biobío · Chile
          </p>
        </div>
      </div>
    </footer>
  );
}
