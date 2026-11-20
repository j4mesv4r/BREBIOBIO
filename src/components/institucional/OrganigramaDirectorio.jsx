import { useEffect, useState } from 'react';
import { Shield, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function TarjetaOrganigrama({ persona, cargoTitulo, badge, variante = 'directorio' }) {
  const esPresidente = variante === 'presidente';
  const esOperativo = variante === 'operativo';
  const iniciales = (persona.nombre_completo || 'B')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div className="escena-3d w-full max-w-[280px]">
      <div
        className={`tarjeta-3d overflow-hidden rounded-2xl border-2 transition-colors ${
          esPresidente
            ? 'sombra-volumetrica-oscura border-[#C8202F] bg-[#17191D] text-white'
            : esOperativo
              ? 'sombra-volumetrica-oscura border-[#F2B632] bg-neutral-900 text-white'
              : 'sombra-volumetrica-clara border-[#17191D] bg-white text-[#17191D]'
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
            esPresidente
              ? 'bg-[#C8202F] text-white'
              : esOperativo
                ? 'bg-[#F2B632] text-[#17191D]'
                : 'bg-[#17191D] text-[#F2B632]'
          }`}
        >
          <span>{badge}</span>
          <Shield size={13} />
        </div>

        <div className="flex flex-col items-center p-5 text-center">
          <div
            className={`capa-z-10 mb-3.5 h-24 w-24 overflow-hidden rounded-full border-4 shadow-lg ${
              esPresidente
                ? 'border-[#F2B632] bg-neutral-800'
                : esOperativo
                  ? 'border-[#C8202F] bg-neutral-800'
                  : 'border-[#17191D] bg-neutral-100'
            }`}
          >
            {persona.foto_url ? (
              <img
                src={persona.foto_url}
                alt={persona.nombre_completo || cargoTitulo}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-black text-neutral-400">
                {iniciales || <User size={32} />}
              </div>
            )}
          </div>

          <p
            className={`capa-z-20 text-base font-black uppercase tracking-tight ${
              esPresidente || esOperativo ? 'text-white' : 'text-[#17191D]'
            }`}
          >
            {cargoTitulo}
          </p>

          <div
            className={`my-2.5 h-1 w-10 rounded-full ${
              esPresidente
                ? 'bg-[#C8202F]'
                : esOperativo
                  ? 'bg-[#F2B632]'
                  : 'bg-[#C8202F]'
            }`}
          />

          <p
            className={`text-sm font-extrabold ${
              esPresidente || esOperativo ? 'text-neutral-100' : 'text-neutral-900'
            }`}
          >
            {persona.nombre_completo}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrganigramaDirectorio() {
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, rol, cargos_operativos, foto_url, genero')
        .eq('estado_validacion', 'aprobado')
        .eq('activo', true);

      if (Array.isArray(data)) {
        setPerfiles(data);
      }
      setLoading(false);
    };

    cargar();
  }, []);

  const buscarPorCargo = (claveCargo) =>
    perfiles.find((p) => {
      const cs = Array.isArray(p.cargos_operativos)
        ? p.cargos_operativos.map((c) => String(c).toLowerCase())
        : [];
      return cs.includes(claveCargo);
    }) || null;

  const presidente = buscarPorCargo('presidente');
  const vicepresidente = buscarPorCargo('vicepresidente');
  const secretario = buscarPorCargo('secretario');
  const tesorero = buscarPorCargo('tesorero');
  const director =
    buscarPorCargo('director') ||
    perfiles.find((p) => (p.rol || '').toLowerCase() === 'director') ||
    null;
  const directorOperativo = buscarPorCargo('do');

  const esMujer = (p) => p?.genero === 'femenino';

  const miembrosDirectorioSecundario = [
    vicepresidente && {
      key: 'vicepresidente',
      persona: vicepresidente,
      titulo: esMujer(vicepresidente) ? 'Vicepresidenta' : 'Vicepresidente',
      badge: 'Directorio',
    },
    secretario && {
      key: 'secretario',
      persona: secretario,
      titulo: esMujer(secretario) ? 'Secretaria' : 'Secretario',
      badge: 'Directorio · Ministro de Fe',
    },
    tesorero && {
      key: 'tesorero',
      persona: tesorero,
      titulo: esMujer(tesorero) ? 'Tesorera' : 'Tesorero',
      badge: 'Directorio · Finanzas',
    },
    director && {
      key: 'director',
      persona: director,
      titulo: esMujer(director) ? 'Directora' : 'Director',
      badge: 'Directorio',
    },
  ].filter(Boolean);

  const hayAlgunCargo = Boolean(
    presidente || miembrosDirectorioSecundario.length > 0 || directorOperativo
  );

  if (!loading && !hayAlgunCargo) {
    return null;
  }

  return (
    <section className="relative z-10 border-y-2 border-neutral-200 bg-[#F3F4F6] py-20 text-[#17191D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 border-l-4 border-[#C8202F] pl-5">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C8202F]">
            Conducción Institucional
          </span>
          <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-[#17191D] sm:text-4xl">
            Organigrama y Directorio
          </h2>
        </div>

        {loading ? (
          <p className="py-8 text-center text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            Cargando estructura institucional...
          </p>
        ) : (
          <div className="flex flex-col items-center">
            {/* Nivel 1: Presidente */}
            {presidente && (
              <div className="flex flex-col items-center">
                <TarjetaOrganigrama
                  persona={presidente}
                  cargoTitulo={esMujer(presidente) ? 'Presidenta' : 'Presidente'}
                  badge="Directorio · Presidencia"
                  variante="presidente"
                />

                {(miembrosDirectorioSecundario.length > 0 || directorOperativo) && (
                  <div className="h-10 w-0.5 bg-[#C8202F]" />
                )}
              </div>
            )}

            {/* Nivel 2: Directorio (hasta Vicepresidente) + Mando Operativo (DO) */}
            {(miembrosDirectorioSecundario.length > 0 || directorOperativo) && (
              <div className="w-full space-y-12">
                {miembrosDirectorioSecundario.length > 0 && (
                  <div className="relative flex flex-col items-center">
                    {miembrosDirectorioSecundario.length > 1 && (
                      <div className="hidden h-0.5 w-3/4 max-w-3xl bg-[#C8202F] lg:block" />
                    )}
                    <div className="mt-0 flex w-full flex-wrap justify-center gap-6 lg:mt-6">
                      {miembrosDirectorioSecundario.map((item) => (
                        <div key={item.key} className="flex flex-col items-center">
                          <div className="hidden h-5 w-0.5 bg-[#C8202F] lg:-mt-6 lg:mb-1 lg:block" />
                          <TarjetaOrganigrama
                            persona={item.persona}
                            cargoTitulo={item.titulo}
                            badge={item.badge}
                            variante="directorio"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {directorOperativo && (
                  <div className="flex flex-col items-center border-t border-dashed border-neutral-300 pt-10">
                    <span className="mb-4 rounded bg-[#17191D] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#F2B632]">
                      Rama Operativa · Designación Directa
                    </span>
                    <TarjetaOrganigrama
                      persona={directorOperativo}
                      cargoTitulo={
                        esMujer(directorOperativo)
                          ? 'Directora Operativa'
                          : 'Director Operativo'
                      }
                      badge={
                        esMujer(directorOperativo)
                          ? 'Voluntaria · Mando Operativo'
                          : 'Voluntario · Mando Operativo'
                      }
                      variante="operativo"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
