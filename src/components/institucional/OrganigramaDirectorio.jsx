import { useEffect, useState } from 'react';
import { Shield, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function TarjetaOrganigrama({ persona, cargoTitulo, variante = 'directorio' }) {
  const esPresidente = variante === 'presidente';
  const esOperativo = variante === 'operativo';
  const esEnlace = variante === 'enlace';

  const iniciales = (persona.nombre_completo || 'B')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div className="escena-3d relative z-10 w-[220px] shrink-0">
      <div
        className={`tarjeta-3d overflow-hidden rounded-2xl border-2 transition-colors ${
          esPresidente
            ? 'sombra-volumetrica-oscura border-[#C8202F] bg-[#17191D] text-white'
            : esOperativo
              ? 'sombra-volumetrica-oscura border-[#F2B632] bg-neutral-900 text-white'
              : esEnlace
                ? 'sombra-volumetrica-clara border-emerald-600 bg-white text-[#17191D]'
                : 'sombra-volumetrica-clara border-[#17191D] bg-white text-[#17191D]'
        }`}
      >
        <div
          className={`flex items-center justify-between px-3.5 py-2 text-[10px] font-black uppercase tracking-wider ${
            esPresidente
              ? 'bg-[#C8202F] text-white'
              : esOperativo
                ? 'bg-[#F2B632] text-[#17191D]'
                : esEnlace
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#17191D] text-[#F2B632]'
          }`}
        >
          <span className="truncate">{cargoTitulo}</span>
          <Shield size={13} className="shrink-0" />
        </div>

        <div className="flex flex-col items-center px-4 py-4 text-center">
          <div
            className={`capa-z-10 mb-3 h-20 w-20 overflow-hidden rounded-full border-4 shadow-lg ${
              esPresidente
                ? 'border-[#F2B632] bg-neutral-800'
                : esOperativo
                  ? 'border-[#C8202F] bg-neutral-800'
                  : esEnlace
                    ? 'border-emerald-500 bg-emerald-50'
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
              <div className="flex h-full w-full items-center justify-center text-lg font-black text-neutral-400">
                {iniciales || <User size={28} />}
              </div>
            )}
          </div>

          <p
            className={`capa-z-20 text-sm font-black uppercase leading-tight tracking-tight ${
              esPresidente || esOperativo
                ? 'text-white'
                : esEnlace
                  ? 'text-emerald-800'
                  : 'text-[#17191D]'
            }`}
          >
            {cargoTitulo}
          </p>

          <div
            className={`my-2 h-1 w-9 rounded-full ${
              esPresidente
                ? 'bg-[#C8202F]'
                : esOperativo
                  ? 'bg-[#F2B632]'
                  : esEnlace
                    ? 'bg-emerald-600'
                    : 'bg-[#C8202F]'
            }`}
          />

          <p
            className={`text-xs font-extrabold leading-snug ${
              esPresidente || esOperativo ? 'text-neutral-100' : 'text-neutral-800'
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
  const secretario = buscarPorCargo('secretario');
  const tesorero = buscarPorCargo('tesorero');
  const director =
    buscarPorCargo('director') ||
    perfiles.find(
      (p) =>
        p.id !== presidente?.id && (p.rol || '').toLowerCase() === 'director'
    ) ||
    null;
  const vicepresidente = buscarPorCargo('vicepresidente');
  const directorOperativo = buscarPorCargo('do');

  const idsJerarquiaPrincipal = new Set(
    [presidente, secretario, tesorero, director, vicepresidente, directorOperativo]
      .filter(Boolean)
      .map((p) => p.id)
  );

  const apoyoAdminEnlace =
    buscarPorCargo('apoyo_admin') ||
    buscarPorCargo('enlace') ||
    buscarPorCargo('administracion') ||
    perfiles.find(
      (p) =>
        !idsJerarquiaPrincipal.has(p.id) &&
        ['superadmin', 'administrador', 'admin'].includes((p.rol || '').toLowerCase())
    ) ||
    null;

  const esMujer = (p) => p?.genero === 'femenino';

  const nivelMesaDirectiva = [
    secretario && {
      key: 'secretario',
      persona: secretario,
      titulo: esMujer(secretario) ? 'SECRETARIA' : 'SECRETARIO',
    },
    tesorero && {
      key: 'tesorero',
      persona: tesorero,
      titulo: esMujer(tesorero) ? 'TESORERA' : 'TESORERO',
    },
    director && {
      key: 'director',
      persona: director,
      titulo: esMujer(director) ? 'DIRECTORA' : 'DIRECTOR',
    },
  ].filter(Boolean);

  const nivelSubroganciaOperativa = [
    vicepresidente && {
      key: 'vicepresidente',
      persona: vicepresidente,
      titulo: esMujer(vicepresidente) ? 'VICEPRESIDENTA' : 'VICEPRESIDENTE',
      variante: 'directorio',
    },
    directorOperativo && {
      key: 'do',
      persona: directorOperativo,
      titulo: esMujer(directorOperativo) ? 'DIREC. OPERATIVA' : 'DIREC. OPERATIVO',
      variante: 'operativo',
    },
  ].filter(Boolean);

  const hayAlgunCargo = Boolean(
    presidente ||
      nivelMesaDirectiva.length > 0 ||
      nivelSubroganciaOperativa.length > 0 ||
      apoyoAdminEnlace
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
          <div className="relative flex flex-col items-center">
            <div className="flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:items-stretch lg:gap-0">
              {/* Árbol Jerárquico Principal */}
              <div className="flex w-full max-w-[740px] flex-col items-center">
                {/* Nivel 1: Presidente */}
                {presidente && (
                  <div className="relative flex flex-col items-center">
                    <div className="relative">
                      <TarjetaOrganigrama
                        persona={presidente}
                        cargoTitulo={esMujer(presidente) ? 'PRESIDENTA' : 'PRESIDENTE'}
                        variante="presidente"
                      />
                      {apoyoAdminEnlace && (
                        <div
                          aria-hidden="true"
                          className="hidden h-[3px] w-[292px] bg-emerald-600 lg:absolute lg:left-full lg:top-1/2 lg:block lg:-translate-y-1/2"
                        />
                      )}
                    </div>
                    {(nivelMesaDirectiva.length > 0 ||
                      nivelSubroganciaOperativa.length > 0) && (
                      <div className="h-8 w-[3px] bg-[#C8202F]" />
                    )}
                  </div>
                )}

                {/* Nivel 2: Secretario/a · Tesorero/a · Director/a */}
                {nivelMesaDirectiva.length > 0 && (
                  <div className="relative flex w-full flex-col items-center">
                    {nivelMesaDirectiva.length > 1 && (
                      <div className="hidden h-[3px] w-2/3 max-w-[490px] bg-[#C8202F] lg:block" />
                    )}

                    <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                      {nivelMesaDirectiva.map((item) => (
                        <div key={item.key} className="flex flex-col items-center">
                          <div className="hidden h-6 w-[3px] bg-[#C8202F] lg:block" />
                          <TarjetaOrganigrama
                            persona={item.persona}
                            cargoTitulo={item.titulo}
                            variante="directorio"
                          />
                        </div>
                      ))}
                    </div>

                    {nivelSubroganciaOperativa.length > 0 && (
                      <div className="h-8 w-[3px] bg-[#C8202F]" />
                    )}
                  </div>
                )}

                {/* Nivel 3: Vicepresidente/a · Direc. Operativo */}
                {nivelSubroganciaOperativa.length > 0 && (
                  <div className="relative flex w-full flex-col items-center">
                    {nivelSubroganciaOperativa.length > 1 && (
                      <div className="hidden h-[3px] w-1/2 max-w-[270px] bg-[#C8202F] lg:block" />
                    )}

                    <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
                      {nivelSubroganciaOperativa.map((item) => (
                        <div
                          key={item.key}
                          className="relative flex flex-col items-center"
                        >
                          <div className="hidden h-6 w-[3px] bg-[#C8202F] lg:block" />
                          <div className="relative">
                            <TarjetaOrganigrama
                              persona={item.persona}
                              cargoTitulo={item.titulo}
                              variante={item.variante}
                            />
                            {item.key === 'do' && apoyoAdminEnlace && (
                              <div
                                aria-hidden="true"
                                className="hidden h-[3px] w-[280px] bg-emerald-600 lg:absolute lg:left-full lg:top-1/2 lg:block lg:-translate-y-1/2"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rama Lateral Derecha: Apoyo Admin. - Enlace (conector esmeralda hacia Presidente y Direc. Operativo) */}
              {apoyoAdminEnlace && (
                <div className="relative flex flex-col items-center justify-between lg:w-[252px] lg:pl-8">
                  <div className="relative flex w-full items-center justify-center lg:justify-end">
                    <TarjetaOrganigrama
                      persona={apoyoAdminEnlace}
                      cargoTitulo="APOYO ADMIN. - ENLACE"
                      variante="enlace"
                    />
                  </div>

                  {/* Conector vertical verde hacia el nivel de Direc. Operativo */}
                  {directorOperativo && (
                    <div className="hidden w-full flex-1 flex-col items-end lg:flex">
                      <div className="mr-[110px] h-full w-[3px] bg-emerald-600" />
                      <div className="mb-[104px] flex w-full items-center justify-end">
                        <div className="mr-[105.5px] h-3 w-3 rounded-full bg-emerald-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
