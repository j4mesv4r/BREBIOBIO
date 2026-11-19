import { useEffect, useState } from 'react';
import {
  Save,
  Upload,
  Globe,
  Home,
  Building2,
  UserPlus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CONTENIDOS_POR_DEFECTO = {
  home_badge: 'Personalidad Jurídica N° 374054',
  home_subbadge: 'Corporación Ley N° 20.500 · San Pedro de la Paz, Biobío',
  home_titulo: 'Preparados para responder,',
  home_titulo_destacado: 'comprometidos con la vida.',
  home_descripcion:
    'Cuerpo especializado de voluntariado táctico al servicio de la comunidad. Operamos en estrecha colaboración con estamentos públicos y privados en áreas urbanas, rurales y zonas agrestes de difícil acceso.',
  home_mision_titulo: 'Nuestra Misión',
  institucion_mision:
    'Proteger y salvar vidas mediante la prevención, cuidado y búsqueda de personas en situaciones de emergencia, en estrecha colaboración con Estamentos Públicos y Privados, a través de la implementación de programas de capacitación, respuesta rápida y asistencia en desastres naturales.',
  institucion_vision:
    'Ser líder en la respuesta a emergencias y desastres, reconocida por su eficacia técnica, profesionalismo y compromiso con la seguridad y bienestar de la comunidad, contribuyendo a construir una sociedad más resiliente y preparada.',
  institucion_donaciones_texto:
    'Respalda nuestras operaciones de búsqueda, rescate, botiquines prehospitalarios, comunicaciones y capacitación de voluntarios.',
  postular_subtitulo:
    'Ingresa tus antecedentes básicos para iniciar el proceso de admisión. Tu ficha quedará en espera de validación por el Directorio antes de habilitar tu perfil operativo.',
  postular_requisitos_edad:
    'Edad mínima de 16 años. Postulantes de 16 y 17 años requieren autorización expresa de padres o apoderados para labores administrativas u operativas seguras sin riesgo físico.',
  postular_youtube_1: 'dQw4w9WgXcQ',
  postular_youtube_2: 'ysz5S6PUM-U',
};

export default function ConfiguracionSitio() {
  const { profile } = useAuth();
  const [seccion, setSeccion] = useState('general');
  const [nombreInstitucion, setNombreInstitucion] = useState('O.N.G. BRE BÍO-BÍO');
  const [logoUrl, setLogoUrl] = useState('/logo-bre.png');
  const [redes, setRedes] = useState({
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
  });
  const [contenidos, setContenidos] = useState(CONTENIDOS_POR_DEFECTO);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [estadoMsg, setEstadoMsg] = useState({ type: '', text: '' });

  const esSuperadmin = (profile?.rol || '').toLowerCase() === 'superadmin';

  useEffect(() => {
    const cargarConfiguracion = async () => {
      const { data, error } = await supabase
        .from('configuracion_sitio')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        if (data.nombre_institucion) setNombreInstitucion(data.nombre_institucion);
        if (data.logo_url) setLogoUrl(data.logo_url);
        setRedes({
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
          tiktok_url: data.tiktok_url || '',
        });
        if (data.contenidos_json && typeof data.contenidos_json === 'object') {
          setContenidos({ ...CONTENIDOS_POR_DEFECTO, ...data.contenidos_json });
        }
      }
    };

    cargarConfiguracion();
  }, []);

  const handleSubirLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !esSuperadmin) return;
    setSubiendoLogo(true);
    setEstadoMsg({ type: '', text: '' });

    try {
      const ext = file.name.split('.').pop();
      const ruta = `logos/logo_bre_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('sitio')
        .upload(ruta, file, { upsert: true });

      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from('sitio').getPublicUrl(ruta);

      setLogoUrl(publicUrl);
      setEstadoMsg({
        type: 'success',
        text: 'Logo subido. Presiona "Guardar Cambios" para publicarlo.',
      });
    } catch (err) {
      setEstadoMsg({
        type: 'error',
        text: err.message || 'No se pudo subir el logo.',
      });
    } finally {
      setSubiendoLogo(false);
    }
  };

  const handleGuardarTodo = async (e) => {
    e.preventDefault();
    if (!esSuperadmin) return;
    setGuardando(true);
    setEstadoMsg({ type: '', text: '' });

    const { error } = await supabase.from('configuracion_sitio').upsert(
      [
        {
          id: 1,
          nombre_institucion: nombreInstitucion.trim() || 'O.N.G. BRE BÍO-BÍO',
          logo_url: logoUrl.trim() || '/logo-bre.png',
          instagram_url: redes.instagram_url.trim(),
          facebook_url: redes.facebook_url.trim(),
          tiktok_url: redes.tiktok_url.trim(),
          contenidos_json: contenidos,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );

    setGuardando(false);
    if (error) {
      setEstadoMsg({ type: 'error', text: error.message });
    } else {
      setEstadoMsg({
        type: 'success',
        text: 'Todos los cambios de la página pública se guardaron en Supabase.',
      });
    }
  };

  return (
    <DashboardLayout
      title="Configuración del Sitio Público"
      subtitle="Edición centralizada de textos, identidad visual, redes y contenidos de la web pública"
    >
      {!esSuperadmin ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-xs font-bold text-red-900">
          Acceso restringido exclusivamente al perfil Superadmin.
        </div>
      ) : (
        <form onSubmit={handleGuardarTodo} className="space-y-6">
          {estadoMsg.text && (
            <div
              className={`flex items-center gap-2 rounded-xl border-l-4 p-4 text-xs font-bold ${estadoMsg.type === 'error'
                  ? 'border-[#D90429] bg-red-50 text-red-900'
                  : 'border-emerald-600 bg-emerald-50 text-emerald-900'
                }`}
            >
              {estadoMsg.type === 'error' ? (
                <AlertCircle size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )}
              <span>{estadoMsg.text}</span>
            </div>
          )}

          {/* Selector de Sección Editable */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
            {[
              { key: 'general', label: 'Logo y Redes Sociales', icon: Globe },
              { key: 'home', label: 'Página Principal (Home)', icon: Home },
              { key: 'institucion', label: 'Institución (Misión / Visión / Donaciones)', icon: Building2 },
              { key: 'postular', label: 'Postulaciones y YouTube', icon: UserPlus },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSeccion(s.key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black uppercase transition-colors ${seccion === s.key
                      ? 'bg-[#0A0A0A] text-[#F2B632]'
                      : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                    }`}
                >
                  <Icon size={14} />
                  {s.label}
                </button>
              );
            })}
          </div>

          {seccion === 'general' && (
            <div className="grid grid-cols-1 gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  Identidad Institucional y Logo
                </h2>
                <div className="flex items-center gap-4">
                  <img
                    src={logoUrl || '/logo-bre.png'}
                    alt="Logo actual"
                    className="h-20 w-20 rounded-full border-2 border-[#0A0A0A] bg-white object-contain p-1"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0A0A0A] px-4 py-2.5 text-xs font-black uppercase text-[#F2B632]">
                    <Upload size={15} />
                    <span>{subiendoLogo ? 'Subiendo...' : 'Cambiar Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubirLogo}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Nombre de la Organización
                  </label>
                  <input
                    type="text"
                    value={nombreInstitucion}
                    onChange={(e) => setNombreInstitucion(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  Redes Sociales en Footer
                </h2>
                <input
                  type="url"
                  value={redes.instagram_url}
                  onChange={(e) =>
                    setRedes({ ...redes, instagram_url: e.target.value })
                  }
                  placeholder="URL Instagram (https://instagram.com/...)"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-semibold"
                />
                <input
                  type="url"
                  value={redes.facebook_url}
                  onChange={(e) =>
                    setRedes({ ...redes, facebook_url: e.target.value })
                  }
                  placeholder="URL Facebook (https://facebook.com/...)"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-semibold"
                />
                <input
                  type="url"
                  value={redes.tiktok_url}
                  onChange={(e) =>
                    setRedes({ ...redes, tiktok_url: e.target.value })
                  }
                  placeholder="URL TikTok (https://tiktok.com/...)"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {seccion === 'home' && (
            <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Textos Principales de Portada (Home)
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Insignia Superior
                  </label>
                  <input
                    type="text"
                    value={contenidos.home_badge}
                    onChange={(e) =>
                      setContenidos({ ...contenidos, home_badge: e.target.value })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Bajada Jurídica
                  </label>
                  <input
                    type="text"
                    value={contenidos.home_subbadge}
                    onChange={(e) =>
                      setContenidos({
                        ...contenidos,
                        home_subbadge: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Título Principal (Línea 1)
                  </label>
                  <input
                    type="text"
                    value={contenidos.home_titulo}
                    onChange={(e) =>
                      setContenidos({
                        ...contenidos,
                        home_titulo: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    Título Destacado (Línea 2)
                  </label>
                  <input
                    type="text"
                    value={contenidos.home_titulo_destacado}
                    onChange={(e) =>
                      setContenidos({
                        ...contenidos,
                        home_titulo_destacado: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Descripción General en Portada
                </label>
                <textarea
                  rows="3"
                  value={contenidos.home_descripcion}
                  onChange={(e) =>
                    setContenidos({
                      ...contenidos,
                      home_descripcion: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {seccion === 'institucion' && (
            <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Misión, Visión y Donaciones (Página Institución)
              </h2>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Texto de Misión
                </label>
                <textarea
                  rows="3"
                  value={contenidos.institucion_mision}
                  onChange={(e) =>
                    setContenidos({
                      ...contenidos,
                      institucion_mision: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Texto de Visión
                </label>
                <textarea
                  rows="3"
                  value={contenidos.institucion_vision}
                  onChange={(e) =>
                    setContenidos({
                      ...contenidos,
                      institucion_vision: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Texto de Donaciones
                </label>
                <textarea
                  rows="2"
                  value={contenidos.institucion_donaciones_texto}
                  onChange={(e) =>
                    setContenidos({
                      ...contenidos,
                      institucion_donaciones_texto: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {seccion === 'postular' && (
            <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Postulaciones y Videos de YouTube
              </h2>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Descripción en Cabecera de Postulación
                </label>
                <textarea
                  rows="2"
                  value={contenidos.postular_subtitulo}
                  onChange={(e) =>
                    setContenidos({
                      ...contenidos,
                      postular_subtitulo: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                  Requisito de Edad y Autorización Parental (16-17 años)
                </label>
                <textarea
                  rows="2"
                  value={contenidos.postular_requisitos_edad}
                  onChange={(e) =>
                    setContenidos({
                      ...contenidos,
                      postular_requisitos_edad: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm font-semibold"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    ID Video YouTube #1
                  </label>
                  <input
                    type="text"
                    value={contenidos.postular_youtube_1}
                    onChange={(e) =>
                      setContenidos({
                        ...contenidos,
                        postular_youtube_1: e.target.value,
                      })
                    }
                    placeholder="Ej. dQw4w9WgXcQ"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                    ID Video YouTube #2
                  </label>
                  <input
                    type="text"
                    value={contenidos.postular_youtube_2}
                    onChange={(e) =>
                      setContenidos({
                        ...contenidos,
                        postular_youtube_2: e.target.value,
                      })
                    }
                    placeholder="Ej. ysz5S6PUM-U"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setContenidos(CONTENIDOS_POR_DEFECTO)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-xs font-black uppercase text-neutral-700 hover:bg-neutral-100"
            >
              <RotateCcw size={15} /> Restaurar Textos Base
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}