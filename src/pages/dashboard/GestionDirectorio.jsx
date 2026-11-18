import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  FileText,
  Siren,
  UserCheck,
  Lock,
  AlertTriangle,
  Eye,
  Award,
  BadgeCheck,
  Camera,
  Download,
  User,
  PhoneCall,
  HeartPulse,
  MapPin,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CATALOGO_CARGOS = [
  {
    key: 'secretario',
    label: 'Secretario',
    corto: 'SEC',
    unico: true,
    descripcion: 'Único (1 en ONG) · Configura visibilidad pública y actas',
  },
  {
    key: 'tesorero',
    label: 'Tesorero',
    corto: 'TES',
    unico: true,
    descripcion: 'Único (1 en ONG) · Gestiona Tesorería y respaldos',
  },
  {
    key: 'do',
    label: 'Director Operativo',
    corto: 'DO',
    unico: false,
    descripcion: 'Mando operativo · Designa DOs, JC, LEM, Instructor y Puesto de Mando',
  },
  {
    key: 'dos',
    label: 'Director Op. Suplente',
    corto: 'DOs',
    unico: false,
    descripcion: 'Designado por SA, DG o DO',
  },
  {
    key: 'jc',
    label: 'Jefe de Cuadrilla',
    corto: 'JC',
    unico: false,
    descripcion: 'Ve antecedentes de su cuadrilla en operativos',
  },
  {
    key: 'lem',
    label: 'Líder Equipo Médico',
    corto: 'LEM',
    unico: false,
    descripcion: 'Coordina área médica y asigna Prehospitalario',
  },
  {
    key: 'prehospitalario',
    label: 'Prehospitalario',
    corto: 'PREHOSP',
    unico: false,
    descripcion: 'Designado por SA, DG, DO o LEM · Ingresa casos de Triage',
  },
  {
    key: 'instructor',
    label: 'Instructor',
    corto: 'INST',
    unico: false,
    descripcion: 'Coordina formación, academias y simulacros operativos',
  },
];

const CAMPOS_VISIBILIDAD = [
  { key: 'foto_url', label: 'Fotografía' },
  { key: 'rut', label: 'RUT' },
  { key: 'especialidad', label: 'Especialidad' },
  { key: 'tipo_sangre', label: 'Tipo Sangre' },
  { key: 'certificados', label: 'Certificados' },
  { key: 'vigencia', label: 'Vigencia' },
  { key: 'telefono', label: 'Teléfono' },
];

export default function GestionDirectorio() {
  const { profile: currentProfile } = useAuth();
  const [tab, setTab] = useState('miembros');
  const [certificados, setCertificados] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState('');
  const [panelAbiertoId, setPanelAbiertoId] = useState(null);
  const [subiendoFotoId, setSubiendoFotoId] = useState(null);

  const rolActual = (currentProfile?.rol || '').toLowerCase();
  const cargosActuales = Array.isArray(currentProfile?.cargos_operativos)
    ? currentProfile.cargos_operativos.map((c) => c.toLowerCase())
    : [];

  const esSA = rolActual === 'superadmin';
  const esDG = rolActual === 'director';
  const esDO = cargosActuales.includes('do');
  const esLEM = cargosActuales.includes('lem');
  const esSecretario = cargosActuales.includes('secretario');

  const puedeEditarVisibilidad = esSA || esDG || esSecretario;

  const puedeAsignarCargo = (claveCargo) => {
    if (esSA || esDG) return true;
    if (esDO && ['dos', 'jc', 'prehospitalario', 'instructor'].includes(claveCargo))
      return true;
    if (esLEM && claveCargo === 'prehospitalario') return true;
    return false;
  };

  const cargarDatos = async () => {
    setLoading(true);
    setAlerta('');
    const [certsRes, solRes, perfRes] = await Promise.all([
      supabase
        .from('certificados')
        .select('*, perfiles(id, nombre_completo, rut, rol, cargos_operativos)')
        .order('creado_en', { ascending: false }),
      supabase
        .from('solicitudes_apoyo')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    if (!certsRes.error && certsRes.data) setCertificados(certsRes.data);
    if (!solRes.error && solRes.data) setSolicitudes(solRes.data);
    if (!perfRes.error && perfRes.data) setMiembros(perfRes.data);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const validarCertificado = async (id, estado) => {
    const { error } = await supabase
      .from('certificados')
      .update({ estado_validacion: estado })
      .eq('id', id);

    if (!error) cargarDatos();
  };

  const cambiarRolMiembro = async (miembroObjetivo, nuevoRol) => {
    setAlerta('');
    const rolObjetivo = (miembroObjetivo.rol || 'postulante').toLowerCase();

    if (!esSA) {
      if (
        rolObjetivo === 'superadmin' ||
        rolObjetivo === 'director' ||
        nuevoRol === 'superadmin' ||
        nuevoRol === 'director'
      ) {
        setAlerta(
          'Jerarquía insuficiente: solo el Superadministrador (SA) puede asignar o modificar Directores (DG) o Superadministradores.'
        );
        return;
      }
    }

    const payload = { rol: nuevoRol };
    if (nuevoRol === 'postulante') {
      payload.cargos_operativos = [];
    }

    const { error } = await supabase
      .from('perfiles')
      .update(payload)
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const toggleCargoOperativo = async (miembroObjetivo, claveCargo) => {
    setAlerta('');
    const rolObjetivo = (miembroObjetivo.rol || 'postulante').toLowerCase();

    if (rolObjetivo === 'postulante') {
      setAlerta(
        'Un usuario con rol Postulante no puede recibir cargos operativos. Apruébalo primero como Voluntario.'
      );
      return;
    }

    if (!puedeAsignarCargo(claveCargo)) {
      setAlerta(
        'No tienes autorización jerárquica para asignar o remover este cargo operativo.'
      );
      return;
    }

    const actuales = Array.isArray(miembroObjetivo.cargos_operativos)
      ? [...miembroObjetivo.cargos_operativos]
      : [];
    const yaTiene = actuales.includes(claveCargo);
    const nuevos = yaTiene
      ? actuales.filter((c) => c !== claveCargo)
      : [...actuales, claveCargo];

    const { error } = await supabase
      .from('perfiles')
      .update({ cargos_operativos: nuevos })
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const toggleCampoVisibilidad = async (miembroObjetivo, claveCampo) => {
    if (!puedeEditarVisibilidad) {
      setAlerta(
        'Solo el Secretario, Director General o Superadministrador pueden configurar la visibilidad pública.'
      );
      return;
    }

    const visActual = miembroObjetivo.visibilidad_publica || {
      foto_url: true,
      rut: true,
      especialidad: true,
      tipo_sangre: true,
      certificados: true,
      vigencia: true,
      telefono: false,
    };

    const visNueva = {
      ...visActual,
      [claveCampo]: !visActual[claveCampo],
    };

    const { error } = await supabase
      .from('perfiles')
      .update({ visibilidad_publica: visNueva })
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const validarMiembro = async (miembroObjetivo, estadoValidacion, nuevoRolOpcional) => {
    setAlerta('');
    const rolObjetivo = (miembroObjetivo.rol || 'postulante').toLowerCase();

    if (!esSA && (rolObjetivo === 'superadmin' || rolObjetivo === 'director')) {
      setAlerta(
        'Jerarquía insuficiente: solo el Superadministrador puede modificar el estado de Directores o Superadministradores.'
      );
      return;
    }

    const payload = { estado_validacion: estadoValidacion };
    if (nuevoRolOpcional) {
      payload.rol = nuevoRolOpcional;
    }

    const { error } = await supabase
      .from('perfiles')
      .update(payload)
      .eq('id', miembroObjetivo.id);

    if (error) {
      setAlerta(error.message);
    } else {
      cargarDatos();
    }
  };

  const handleAdminSubirFotoMiembro = async (miembroId, file) => {
    if (!esSA || !file) return;
    setAlerta('');
    setSubiendoFotoId(miembroId);

    try {
      const ext = file.name.split('.').pop();
      const filePath = `${miembroId}/uniformada_${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatares')
        .upload(filePath, file, { upsert: true });

      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatares').getPublicUrl(filePath);

      const { error: dbErr } = await supabase
        .from('perfiles')
        .update({
          foto_url: publicUrl,
          usando_avatar_generico: false,
        })
        .eq('id', miembroId);

      if (dbErr) throw dbErr;

      cargarDatos();
    } catch (err) {
      setAlerta(err.message || 'No se pudo actualizar la fotografía del miembro.');
    } finally {
      setSubiendoFotoId(null);
    }
  };

  const actualizarSolicitud = async (id, estado) => {
    const { error } = await supabase
      .from('solicitudes_apoyo')
      .update({ estado })
      .eq('id', id);

    if (!error) cargarDatos();
  };

  return (
    <DashboardLayout
      title="Gestión de Directorio y Cargos"
      subtitle="Control de los 4 roles institucionales, revisión completa de postulantes y cargos operativos"
      actions={
        <div className="flex items-center gap-2">
          {cargosActuales.map((c) => (
            <span
              key={c}
              className="hidden rounded-lg bg-red-100 px-2.5 py-1 text-[10px] font-black uppercase text-[#D90429] sm:inline-block"
            >
              {c}
            </span>
          ))}
          <span
            className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${esSA
                ? 'bg-[#0A0A0A] text-[#F2B632]'
                : 'bg-red-100 text-[#D90429]'
              }`}
          >
            {rolActual}
          </span>
        </div>
      }
    >
      {alerta && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border-l-4 border-[#D90429] bg-red-50 p-4 text-xs font-bold text-red-900">
          <AlertTriangle
            size={18}
            strokeWidth={2.5}
            className="shrink-0 text-[#D90429]"
          />
          <span>{alerta}</span>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200">
        <button
          onClick={() => setTab('miembros')}
          className={`border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${tab === 'miembros'
              ? 'border-[#D90429] text-[#D90429]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
        >
          Miembros y Postulantes (
          {miembros.filter((m) => m.estado_validacion === 'pendiente').length}{' '}
          pendientes)
        </button>
        <button
          onClick={() => setTab('certificados')}
          className={`border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${tab === 'certificados'
              ? 'border-[#D90429] text-[#D90429]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
        >
          Certificados ({certificados.length})
        </button>
        <button
          onClick={() => setTab('solicitudes')}
          className={`border-b-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${tab === 'solicitudes'
              ? 'border-[#D90429] text-[#D90429]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
        >
          Solicitudes de Apoyo ({solicitudes.length})
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm font-bold text-neutral-500">
          Cargando registros institucionales...
        </p>
      ) : tab === 'miembros' ? (
        <div className="space-y-4">
          {miembros.map((m) => {
            const rolObjetivo = (m.rol || 'postulante').toLowerCase();
            const cargosMiembro = Array.isArray(m.cargos_operativos)
              ? m.cargos_operativos
              : [];
            const especialidadesLista =
              Array.isArray(m.especialidades) && m.especialidades.length > 0
                ? m.especialidades.join(' · ')
                : m.especialidad || '';
            const visPublica = m.visibilidad_publica || {
              foto_url: true,
              rut: true,
              especialidad: true,
              tipo_sangre: true,
              certificados: true,
              vigencia: true,
              telefono: false,
            };

            const protegidoParaNoSA =
              !esSA &&
              (rolObjetivo === 'superadmin' || rolObjetivo === 'director');

            const expandido = panelAbiertoId === m.id;

            return (
              <div
                key={m.id}
                className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                {/* Fila Superior: Identidad + Rol de Sistema + Aprobación */}
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="flex items-start gap-3.5">
                    <div className="h-14 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100">
                      {m.foto_url ? (
                        <img
                          src={m.foto_url}
                          alt={m.nombre_completo}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="m-auto mt-3 text-neutral-400" size={24} />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-neutral-950">
                          {m.nombre_completo || m.email || 'Sin nombre'}
                        </h3>

                        {m.codigo_credencial && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[#0A0A0A] px-2.5 py-0.5 text-[11px] font-black tracking-wider text-[#F2B632]">
                            <BadgeCheck size={13} strokeWidth={2.5} />
                            {m.codigo_credencial}
                          </span>
                        )}

                        <span
                          className={`rounded-lg px-2.5 py-0.5 text-[11px] font-black uppercase ${m.estado_validacion === 'aprobado'
                              ? 'bg-green-100 text-green-700'
                              : m.estado_validacion === 'rechazado'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {m.estado_validacion || 'pendiente'}
                        </span>

                        {!m.onboarding_completado && (
                          <span className="rounded-lg bg-neutral-200 px-2 py-0.5 text-[10px] font-black uppercase text-neutral-700">
                            Ficha Incompleta
                          </span>
                        )}

                        {m.es_menor_autorizado && (
                          <span className="rounded-lg bg-[#F2B632] px-2.5 py-0.5 text-[11px] font-black uppercase text-black">
                            Menor Autorizado (16-17)
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-neutral-600">
                        RUT: {m.rut || 'No registrado'} · Tel:{' '}
                        {m.telefono || 'Sin teléfono'}
                        {m.email ? ` · Email: ${m.email}` : ''}
                      </p>

                      {cargosMiembro.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cargosMiembro.map((cargoKey) => {
                            const info = CATALOGO_CARGOS.find(
                              (c) => c.key === cargoKey
                            );
                            return (
                              <span
                                key={cargoKey}
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase text-[#D90429]"
                              >
                                <Award size={12} strokeWidth={2.5} />
                                {info ? info.label : cargoKey}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controles de Rol y Aprobación */}
                  <div className="flex flex-wrap items-center gap-2">
                    {protegidoParaNoSA ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-xs font-black uppercase text-neutral-600">
                        <Lock size={14} strokeWidth={2.5} /> {rolObjetivo}{' '}
                        (Protegido)
                      </span>
                    ) : (
                      <>
                        <select
                          aria-label="Rol del sistema"
                          value={rolObjetivo}
                          onChange={(e) =>
                            cambiarRolMiembro(m, e.target.value)
                          }
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-black uppercase text-neutral-800"
                        >
                          <option value="postulante">Postulante</option>
                          <option value="voluntario">Voluntario</option>
                          {esSA && (
                            <>
                              <option value="director">Director (DG)</option>
                              <option value="superadmin">
                                Superadmin (SA)
                              </option>
                            </>
                          )}
                        </select>

                        {m.estado_validacion !== 'aprobado' && (
                          <button
                            onClick={() =>
                              validarMiembro(
                                m,
                                'aprobado',
                                rolObjetivo === 'postulante'
                                  ? 'postulante'
                                  : undefined
                              )
                            }
                            title="Autoriza el ingreso del usuario manteniendo su rol o promoviéndolo"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3.5 py-2 text-xs font-black uppercase text-white hover:bg-green-700"
                          >
                            <CheckCircle size={15} strokeWidth={2.5} /> Aprobar
                          </button>
                        )}

                        {m.estado_validacion === 'pendiente' && (
                          <button
                            onClick={() => validarMiembro(m, 'rechazado')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-3.5 py-2 text-xs font-black uppercase text-white hover:bg-red-700"
                          >
                            <XCircle size={15} strokeWidth={2.5} /> Rechazar
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPanelAbiertoId(expandido ? null : m.id)
                      }
                      className="rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-black uppercase text-neutral-800 hover:bg-neutral-100"
                    >
                      {expandido ? 'Ocultar Ficha' : 'Ver Ficha y Cargos'}
                    </button>
                  </div>
                </div>

                {/* Panel Desplegable: Ficha Completa del Postulante/Miembro + Cargos + Visibilidad */}
                {expandido && (
                  <div className="grid grid-cols-1 gap-6 border-t border-neutral-100 pt-4 lg:grid-cols-2">
                    {/* Bloque 0: Antecedentes Completos Ingresados por el Postulante/Voluntario */}
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:col-span-2">
                      <h4 className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                        <User size={15} strokeWidth={2.5} className="text-[#D90429]" />
                        Ficha Completa de Antecedentes (Revisión para Autorización)
                      </h4>
                      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                        <div className="rounded-lg bg-white p-2.5 border border-neutral-200">
                          <span className="block text-[10px] font-black uppercase text-neutral-400">
                            Ubicación
                          </span>
                          <span className="font-bold text-neutral-800 flex items-center gap-1 mt-0.5">
                            <MapPin size={13} className="text-[#D90429]" />
                            {m.region || 'Región del Biobío'} · {m.comuna || 'Sin comuna'}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white p-2.5 border border-neutral-200">
                          <span className="block text-[10px] font-black uppercase text-neutral-400">
                            Salud y Sangre
                          </span>
                          <span className="font-bold text-red-700 flex items-center gap-1 mt-0.5">
                            <HeartPulse size={13} />
                            Sangre: {m.tipo_sangre || 'No especificado'} · Alergias:{' '}
                            {m.alergias || 'Ninguna'}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white p-2.5 border border-neutral-200">
                          <span className="block text-[10px] font-black uppercase text-neutral-400">
                            Contacto Emergencia (ICE)
                          </span>
                          <span className="font-bold text-neutral-800 flex items-center gap-1 mt-0.5">
                            <PhoneCall size={13} className="text-emerald-600" />
                            {m.contacto_emergencia_nombre || 'N/R'} (
                            {m.contacto_emergencia_telefono || 'N/R'})
                          </span>
                        </div>
                        <div className="rounded-lg bg-white p-2.5 border border-neutral-200 sm:col-span-3">
                          <span className="block text-[10px] font-black uppercase text-neutral-400">
                            Especialidades y Áreas Declaradas
                          </span>
                          <span className="font-bold text-neutral-800 mt-0.5 block">
                            {especialidadesLista || 'Sin especialidades registradas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bloque 1: Asignación de Cargos Operativos Múltiples */}
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                          <Award
                            size={15}
                            strokeWidth={2.5}
                            className="text-[#D90429]"
                          />
                          Cargos Operativos Acumulables
                        </h4>
                        {rolObjetivo === 'postulante' && (
                          <span className="text-[10px] font-black uppercase text-amber-700">
                            Solo para Voluntarios / Directivos
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {CATALOGO_CARGOS.map((cargo) => {
                          const activo = cargosMiembro.includes(cargo.key);
                          const permitido =
                            rolObjetivo !== 'postulante' &&
                            puedeAsignarCargo(cargo.key);

                          return (
                            <button
                              key={cargo.key}
                              type="button"
                              disabled={!permitido}
                              title={cargo.descripcion}
                              onClick={() =>
                                toggleCargoOperativo(m, cargo.key)
                              }
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition-all ${activo
                                  ? 'border-[#0A0A0A] bg-[#0A0A0A] text-[#F2B632] shadow-sm'
                                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400'
                                } disabled:cursor-not-allowed disabled:opacity-45`}
                            >
                              <span>{cargo.label}</span>
                              {cargo.unico && (
                                <span className="rounded bg-red-600 px-1.5 py-0.2 text-[9px] uppercase text-white">
                                  Único
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bloque 2: Visibilidad Pública en Ficha QR */}
                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                          <Eye
                            size={15}
                            strokeWidth={2.5}
                            className="text-[#D90429]"
                          />
                          Datos Públicos Visibles en QR (Fiscalización)
                        </h4>
                        {!puedeEditarVisibilidad && (
                          <span className="text-[10px] font-black uppercase text-neutral-400">
                            Solo Secretario / DG / SA
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {CAMPOS_VISIBILIDAD.map((campo) => {
                          const visible = Boolean(visPublica[campo.key]);
                          return (
                            <button
                              key={campo.key}
                              type="button"
                              disabled={!puedeEditarVisibilidad}
                              onClick={() =>
                                toggleCampoVisibilidad(m, campo.key)
                              }
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition-colors ${visible
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                                  : 'border-neutral-300 bg-white text-neutral-400'
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${visible ? 'bg-emerald-600' : 'bg-neutral-300'
                                  }`}
                              />
                              {campo.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bloque 3 (Exclusivo Superadmin): Descarga y Reemplazo de Fotografía */}
                    {esSA && (
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 lg:col-span-2">
                        <h4 className="mb-2.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                          Gestión de Fotografía Institucional (Exclusivo Superadmin)
                        </h4>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-[#0A0A0A] bg-white">
                            {m.foto_url ? (
                              <img
                                src={m.foto_url}
                                alt={m.nombre_completo}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center text-center text-[10px] font-black uppercase text-neutral-400">
                                Sin Foto
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {m.foto_url && (
                              <a
                                href={m.foto_url}
                                download={`Foto_${m.rut || m.id}.png`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-black uppercase text-neutral-800 hover:bg-neutral-100"
                              >
                                <Download size={14} strokeWidth={2.5} /> Descargar Foto Original
                              </a>
                            )}

                            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-4 py-2 text-xs font-black uppercase text-[#F2B632] hover:bg-neutral-800">
                              <Camera size={14} strokeWidth={2.5} />
                              <span>
                                {subiendoFotoId === m.id
                                  ? 'Subiendo imagen...'
                                  : 'Subir / Reemplazar Foto con Uniforme'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={subiendoFotoId === m.id}
                                onChange={(e) =>
                                  handleAdminSubirFotoMiembro(
                                    m.id,
                                    e.target.files?.[0]
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : tab === 'certificados' ? (
        <div className="space-y-4">
          {certificados.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-500">
              No hay certificados registrados.
            </p>
          ) : (
            certificados.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-neutral-900">
                      {cert.titulo_curso}
                    </h3>
                    <span className="rounded-lg bg-neutral-100 px-2.5 py-0.5 text-[11px] font-black uppercase text-neutral-700">
                      {cert.estado_validacion}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-600">
                    {cert.perfiles?.nombre_completo || 'Sin nombre'} (
                    {cert.perfiles?.rut || 'Sin RUT'}) — Rol:{' '}
                    <strong className="uppercase">{cert.perfiles?.rol}</strong>
                  </p>
                  <p className="text-xs text-neutral-400">
                    Institución: {cert.institucion || 'No indicada'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {cert.archivo_url && (
                    <a
                      href={cert.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-black uppercase text-neutral-700 hover:bg-neutral-100"
                    >
                      <FileText size={15} strokeWidth={2.5} /> Ver PDF
                    </a>
                  )}

                  <button
                    onClick={() => validarCertificado(cert.id, 'aprobado')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-black uppercase text-white hover:bg-green-700"
                  >
                    <CheckCircle size={15} strokeWidth={2.5} /> Aprobar
                  </button>

                  <button
                    onClick={() => validarCertificado(cert.id, 'rechazado')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-3 py-2 text-xs font-black uppercase text-white hover:bg-red-700"
                  >
                    <XCircle size={15} strokeWidth={2.5} /> Rechazar
                  </button>

                  {cert.perfiles?.rol === 'postulante' && (
                    <button
                      onClick={() =>
                        cambiarRolMiembro(cert.perfiles, 'voluntario')
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3 py-2 text-xs font-black uppercase text-white hover:bg-neutral-800"
                    >
                      <UserCheck size={15} strokeWidth={2.5} /> Ascender a
                      Voluntario
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm font-semibold text-neutral-500">
              No hay solicitudes de apoyo recibidas.
            </p>
          ) : (
            solicitudes.map((sol) => (
              <div
                key={sol.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Siren
                      size={20}
                      strokeWidth={2.5}
                      className="text-[#D90429]"
                    />
                    <h3 className="font-black text-neutral-900">
                      {sol.solicitante} — {sol.tipo_apoyo}
                    </h3>
                  </div>
                  <select
                    value={sol.estado}
                    onChange={(e) =>
                      actualizarSolicitud(sol.id, e.target.value)
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-black uppercase"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Atendida">Atendida</option>
                  </select>
                </div>
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  {sol.descripcion}
                </p>
                <p className="text-xs font-semibold text-neutral-500">
                  Contacto: {sol.telefono} · {sol.email}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}