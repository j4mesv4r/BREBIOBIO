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
  Plus,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
  Image,
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
  home_foto_hero: '',
  home_foto_bosque: '',
  home_foto_auxilios: '',
  home_foto_altura: '',
};

const GALERIA_FOTOS_POR_DEFECTO = [
  {
    id: 'gal-1',
    url: '/terreno/operativo-bosque.jpg',
    titulo: 'Búsqueda en Sector Forestal',
  },
  {
    id: 'gal-2',
    url: '/terreno/primeros-auxilios.jpg',
    titulo: 'Instrucción Prehospitalaria',
  },
  {
    id: 'gal-3',
    url: '/terreno/rescate-altura.jpg',
    titulo: 'Entrenamiento en Cuerdas',
  },
];

const MEMORIAS_POR_DEFECTO = [
  {
    anio: '2025',
    titulo: 'Memoria Anual Institucional 2025',
    portada: '/memorias/portada-2025.png',
    pdf: '/memorias/memoria-2025.pdf',
  },
  {
    anio: '2024',
    titulo: 'Memoria Anual Institucional 2024',
    portada: '/memorias/portada-2024.png',
    pdf: '/memorias/memoria-2024.pdf',
  },
];

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
  const [memorias, setMemorias] = useState(MEMORIAS_POR_DEFECTO);
  const [galeriaFotos, setGaleriaFotos] = useState(GALERIA_FOTOS_POR_DEFECTO);
  const [metricasAnuales, setMetricasAnuales] = useState({
    busquedas: '',
    despliegues: '',
    emergencias: '',
    simulacros: '',
  });
  const [nuevaFotoGaleria, setNuevaFotoGaleria] = useState({
    url: '',
    titulo: '',
  });
  const [nuevaMemoria, setNuevaMemoria] = useState({
    anio: '',
    titulo: '',
    portada: '',
    pdf: '',
  });
  const [subiendoArchivo, setSubiendoArchivo] = useState('');
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
          if (Array.isArray(data.contenidos_json.memorias)) {
            setMemorias(data.contenidos_json.memorias);
          }
          if (Array.isArray(data.contenidos_json.galeria_fotos)) {
            setGaleriaFotos(data.contenidos_json.galeria_fotos);
          }
          if (
            data.contenidos_json.metricas_anuales &&
            typeof data.contenidos_json.metricas_anuales === 'object'
          ) {
            const m = data.contenidos_json.metricas_anuales;
            setMetricasAnuales({
              busquedas:
                m.busquedas !== null && m.busquedas !== undefined
                  ? String(m.busquedas)
                  : '',
              despliegues:
                m.despliegues !== null && m.despliegues !== undefined
                  ? String(m.despliegues)
                  : '',
              emergencias:
                m.emergencias !== null && m.emergencias !== undefined
                  ? String(m.emergencias)
                  : '',
              simulacros:
                m.simulacros !== null && m.simulacros !== undefined
                  ? String(m.simulacros)
                  : '',
            });
          }
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

  const handleSubirArchivoMemoria = async (file, carpeta, onSuccess, keyId) => {
    if (!file || !esSuperadmin) return;
    setSubiendoArchivo(keyId);
    setEstadoMsg({ type: '', text: '' });

    try {
      const ext = file.name.split('.').pop();
      const ruta = `memorias/${carpeta}/mem_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('sitio')
        .upload(ruta, file, { upsert: true });

      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from('sitio').getPublicUrl(ruta);

      onSuccess(publicUrl);
      setEstadoMsg({
        type: 'success',
        text: 'Archivo subido al bucket sitio. Presiona "Guardar Cambios" para publicarlo.',
      });
    } catch (err) {
      setEstadoMsg({
        type: 'error',
        text: err.message || 'No se pudo subir el archivo.',
      });
    } finally {
      setSubiendoArchivo('');
    }
  };

  const handleAgregarMemoria = () => {
    if (!nuevaMemoria.anio.trim() || !nuevaMemoria.titulo.trim()) {
      setEstadoMsg({
        type: 'error',
        text: 'Ingresa al menos el año y título de la memoria anual.',
      });
      return;
    }

    setMemorias((prev) => [
      {
        anio: nuevaMemoria.anio.trim(),
        titulo: nuevaMemoria.titulo.trim(),
        portada: nuevaMemoria.portada.trim(),
        pdf: nuevaMemoria.pdf.trim(),
      },
      ...prev,
    ]);
    setNuevaMemoria({ anio: '', titulo: '', portada: '', pdf: '' });
  };

  const handleEliminarMemoria = (idx) => {
    setMemorias((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleActualizarMemoria = (idx, campo, valor) => {
    setMemorias((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [campo]: valor } : m))
    );
  };

  const handleSubirFotoSitio = async (file, carpeta, onSuccess, keyId) => {
    if (!file || !esSuperadmin) return;
    setSubiendoArchivo(keyId);
    setEstadoMsg({ type: '', text: '' });

    try {
      const ext = file.name.split('.').pop();
      const ruta = `${carpeta}/foto_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('sitio')
        .upload(ruta, file, { upsert: true });

      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from('sitio').getPublicUrl(ruta);

      onSuccess(publicUrl);
      setEstadoMsg({
        type: 'success',
        text: 'Fotografía subida al bucket sitio. Presiona "Guardar Cambios" para publicarla.',
      });
    } catch (err) {
      setEstadoMsg({
        type: 'error',
        text: err.message || 'No se pudo subir la fotografía.',
      });
    } finally {
      setSubiendoArchivo('');
    }
  };

  const handleAgregarFotoGaleria = () => {
    if (!nuevaFotoGaleria.url.trim()) {
      setEstadoMsg({
        type: 'error',
        text: 'Ingresa o sube una fotografía para agregarla a la galería.',
      });
      return;
    }

    setGaleriaFotos((prev) => [
      ...prev,
      {
        id: `gal-${Date.now()}`,
        url: nuevaFotoGaleria.url.trim(),
        titulo: nuevaFotoGaleria.titulo.trim() || 'Registro Operativo BRE',
      },
    ]);
    setNuevaFotoGaleria({ url: '', titulo: '' });
  };

  const handleMoverFotoGaleria = (idx, direccion) => {
    setGaleriaFotos((prev) => {
      const destino = idx + direccion;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      const [item] = copia.splice(idx, 1);
      copia.splice(destino, 0, item);
      return copia;
    });
  };

  const handleActualizarFotoGaleria = (idx, campo, valor) => {
    setGaleriaFotos((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [campo]: valor } : f))
    );
  };

  const handleEliminarFotoGaleria = (idx) => {
    setGaleriaFotos((prev) => prev.filter((_, i) => i !== idx));
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
          contenidos_json: {
            ...contenidos,
            memorias,
            galeria_fotos: galeriaFotos,
            metricas_anuales: {
              busquedas:
                metricasAnuales.busquedas !== ''
                  ? Number(metricasAnuales.busquedas)
                  : null,
              despliegues:
                metricasAnuales.despliegues !== ''
                  ? Number(metricasAnuales.despliegues)
                  : null,
              emergencias:
                metricasAnuales.emergencias !== ''
                  ? Number(metricasAnuales.emergencias)
                  : null,
              simulacros:
                metricasAnuales.simulacros !== ''
                  ? Number(metricasAnuales.simulacros)
                  : null,
            },
          },
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

              {/* Fotografías de Portada y Terreno */}
              <div className="space-y-4 border-t border-neutral-200 pt-5">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                  <Image size={15} className="text-[#D90429]" />
                  Fotografías de Portada y Terreno (Bucket sitio o URL)
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    { key: 'home_foto_hero', label: 'Foto Hero Principal' },
                    { key: 'home_foto_bosque', label: 'Foto Búsqueda en Bosque' },
                    { key: 'home_foto_auxilios', label: 'Foto Primeros Auxilios' },
                    { key: 'home_foto_altura', label: 'Foto Rescate en Altura' },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                        {item.label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={contenidos[item.key] || ''}
                          onChange={(e) =>
                            setContenidos({
                              ...contenidos,
                              [item.key]: e.target.value,
                            })
                          }
                          placeholder="URL imagen o sube al bucket sitio"
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                        />
                        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-[#0A0A0A] px-3 py-2 text-[11px] font-black uppercase text-white hover:bg-neutral-800">
                          <Upload size={13} />
                          <span>
                            {subiendoArchivo === item.key ? '...' : 'Subir'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleSubirFotoSitio(
                                e.target.files?.[0],
                                'terreno',
                                (url) =>
                                  setContenidos((prev) => ({
                                    ...prev,
                                    [item.key]: url,
                                  })),
                                item.key
                              )
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gestor de Galería Continua */}
              <div className="space-y-4 border-t border-neutral-200 pt-5">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                  <Image size={15} className="text-[#D90429]" />
                  Galería Desplazamiento Continuo (Home y Postular)
                </h3>

                <div className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 sm:grid-cols-12">
                  <div className="flex gap-2 sm:col-span-6">
                    <input
                      type="text"
                      value={nuevaFotoGaleria.url}
                      onChange={(e) =>
                        setNuevaFotoGaleria({
                          ...nuevaFotoGaleria,
                          url: e.target.value,
                        })
                      }
                      placeholder="URL fotografía o sube imagen"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                    />
                    <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-[#0A0A0A] px-3 py-2 text-[11px] font-black uppercase text-white hover:bg-neutral-800">
                      <Upload size={13} />
                      <span>
                        {subiendoArchivo === 'nueva-galeria' ? '...' : 'Foto'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleSubirFotoSitio(
                            e.target.files?.[0],
                            'galeria',
                            (url) =>
                              setNuevaFotoGaleria((prev) => ({
                                ...prev,
                                url,
                              })),
                            'nueva-galeria'
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={nuevaFotoGaleria.titulo}
                    onChange={(e) =>
                      setNuevaFotoGaleria({
                        ...nuevaFotoGaleria,
                        titulo: e.target.value,
                      })
                    }
                    placeholder="Título / pie de foto"
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold sm:col-span-4"
                  />
                  <button
                    type="button"
                    onClick={handleAgregarFotoGaleria}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#0A0A0A] px-3 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800 sm:col-span-2"
                  >
                    <Plus size={14} /> Agregar
                  </button>
                </div>

                <div className="space-y-2.5">
                  {galeriaFotos.map((foto, idx) => (
                    <div
                      key={foto.id || idx}
                      className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-3 sm:flex-row sm:items-center"
                    >
                      <input
                        type="text"
                        value={foto.url}
                        onChange={(e) =>
                          handleActualizarFotoGaleria(idx, 'url', e.target.value)
                        }
                        placeholder="URL"
                        className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={foto.titulo}
                        onChange={(e) =>
                          handleActualizarFotoGaleria(idx, 'titulo', e.target.value)
                        }
                        placeholder="Título"
                        className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoverFotoGaleria(idx, -1)}
                          disabled={idx === 0}
                          className="rounded-lg border border-neutral-300 p-1.5 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                          title="Subir"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoverFotoGaleria(idx, 1)}
                          disabled={idx === galeriaFotos.length - 1}
                          className="rounded-lg border border-neutral-300 p-1.5 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                          title="Bajar"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarFotoGaleria(idx)}
                          className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-[#D90429] hover:bg-red-100"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas Anuales Manuales */}
              <div className="space-y-3 border-t border-neutral-200 pt-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  Métricas Anuales en Portada (Opcional: deja vacío para usar conteo automático)
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { key: 'busquedas', label: 'Búsquedas' },
                    { key: 'despliegues', label: 'Despliegues' },
                    { key: 'emergencias', label: 'Emergencias' },
                    { key: 'simulacros', label: 'Simulacros' },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                        {item.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={metricasAnuales[item.key]}
                        onChange={(e) =>
                          setMetricasAnuales({
                            ...metricasAnuales,
                            [item.key]: e.target.value,
                          })
                        }
                        placeholder="Auto"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm font-bold"
                      />
                    </div>
                  ))}
                </div>
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

              {/* Gestión Dinámica de Memorias Anuales */}
              <div className="space-y-4 border-t border-neutral-200 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                    <FileText size={15} className="text-[#D90429]" />
                    Memorias Anuales (Portada + PDF / Google Drive)
                  </h3>
                </div>

                {/* Agregar Nueva Memoria */}
                <div className="space-y-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-neutral-700">
                    Agregar Nueva Memoria
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <input
                      type="text"
                      value={nuevaMemoria.anio}
                      onChange={(e) =>
                        setNuevaMemoria({ ...nuevaMemoria, anio: e.target.value })
                      }
                      placeholder="Año (ej. 2026)"
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={nuevaMemoria.titulo}
                      onChange={(e) =>
                        setNuevaMemoria({ ...nuevaMemoria, titulo: e.target.value })
                      }
                      placeholder="Título de la memoria"
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold sm:col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nuevaMemoria.portada}
                        onChange={(e) =>
                          setNuevaMemoria({ ...nuevaMemoria, portada: e.target.value })
                        }
                        placeholder="URL portada o sube imagen"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                      />
                      <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-[#0A0A0A] px-3 py-2 text-[11px] font-black uppercase text-white hover:bg-neutral-800">
                        <Upload size={13} />
                        <span>{subiendoArchivo === 'nueva-portada' ? '...' : 'Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleSubirArchivoMemoria(
                              e.target.files?.[0],
                              'portadas',
                              (url) =>
                                setNuevaMemoria((prev) => ({ ...prev, portada: url })),
                              'nueva-portada'
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nuevaMemoria.pdf}
                        onChange={(e) =>
                          setNuevaMemoria({ ...nuevaMemoria, pdf: e.target.value })
                        }
                        placeholder="URL PDF / Google Drive o sube PDF"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                      />
                      <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-[#0A0A0A] px-3 py-2 text-[11px] font-black uppercase text-white hover:bg-neutral-800">
                        <Upload size={13} />
                        <span>{subiendoArchivo === 'nuevo-pdf' ? '...' : 'PDF'}</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) =>
                            handleSubirArchivoMemoria(
                              e.target.files?.[0],
                              'pdfs',
                              (url) =>
                                setNuevaMemoria((prev) => ({ ...prev, pdf: url })),
                              'nuevo-pdf'
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAgregarMemoria}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800"
                  >
                    <Plus size={14} /> Agregar Memoria
                  </button>
                </div>

                {/* Lista de Memorias Configuradas */}
                <div className="space-y-3">
                  {memorias.map((mem, idx) => (
                    <div
                      key={`${mem.anio}-${idx}`}
                      className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4">
                          <input
                            type="text"
                            value={mem.anio}
                            onChange={(e) =>
                              handleActualizarMemoria(idx, 'anio', e.target.value)
                            }
                            placeholder="Año"
                            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold"
                          />
                          <input
                            type="text"
                            value={mem.titulo}
                            onChange={(e) =>
                              handleActualizarMemoria(idx, 'titulo', e.target.value)
                            }
                            placeholder="Título"
                            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold sm:col-span-3"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEliminarMemoria(idx)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black uppercase text-[#D90429] hover:bg-red-100"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={mem.portada || mem.portada_url || ''}
                            onChange={(e) =>
                              handleActualizarMemoria(idx, 'portada', e.target.value)
                            }
                            placeholder="URL portada"
                            className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                          />
                          <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-[11px] font-black uppercase text-white hover:bg-neutral-700">
                            <Upload size={12} />
                            <span>
                              {subiendoArchivo === `portada-${idx}` ? '...' : 'Foto'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleSubirArchivoMemoria(
                                  e.target.files?.[0],
                                  'portadas',
                                  (url) => handleActualizarMemoria(idx, 'portada', url),
                                  `portada-${idx}`
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={mem.pdf || mem.descarga_url || ''}
                            onChange={(e) =>
                              handleActualizarMemoria(idx, 'pdf', e.target.value)
                            }
                            placeholder="URL PDF / Google Drive"
                            className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
                          />
                          <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-[11px] font-black uppercase text-white hover:bg-neutral-700">
                            <Upload size={12} />
                            <span>
                              {subiendoArchivo === `pdf-${idx}` ? '...' : 'PDF'}
                            </span>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) =>
                                handleSubirArchivoMemoria(
                                  e.target.files?.[0],
                                  'pdfs',
                                  (url) => handleActualizarMemoria(idx, 'pdf', url),
                                  `pdf-${idx}`
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

              {/* Fotografías de Despliegues en Postular */}
              <div className="space-y-3 border-t border-neutral-200 pt-4">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-900">
                  <Image size={15} className="text-[#D90429]" />
                  Fotografías de Despliegues (Postulación)
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { key: 'home_foto_bosque', label: 'Despliegue Forestal' },
                    { key: 'home_foto_auxilios', label: 'Primeros Auxilios' },
                    { key: 'home_foto_altura', label: 'Rescate en Altura' },
                  ].map((item) => (
                    <div key={`post-${item.key}`}>
                      <label className="mb-1 block text-xs font-black uppercase text-neutral-700">
                        {item.label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={contenidos[item.key] || ''}
                          onChange={(e) =>
                            setContenidos({
                              ...contenidos,
                              [item.key]: e.target.value,
                            })
                          }
                          placeholder="URL imagen"
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                        />
                        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-[#0A0A0A] px-3 py-2 text-[11px] font-black uppercase text-white hover:bg-neutral-800">
                          <Upload size={13} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleSubirFotoSitio(
                                e.target.files?.[0],
                                'terreno',
                                (url) =>
                                  setContenidos((prev) => ({
                                    ...prev,
                                    [item.key]: url,
                                  })),
                                `post-${item.key}`
                              )
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
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