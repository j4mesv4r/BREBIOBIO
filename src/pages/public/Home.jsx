import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Compass, HeartHandshake, Award, Activity, CheckCircle, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-neutral-950 text-white min-h-screen font-sans selection:bg-red-600 selection:text-white">

      {/* 1. SECCIÓN HERO (PORTADA PRINCIPAL INSTITUCIONAL) */}
      <section className="relative bg-black border-b-2 border-neutral-800 overflow-hidden">
        {/* Trama de fondo táctica sutil */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C8202F_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Columna de Texto Institucional */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 text-xs font-black uppercase tracking-widest shadow-sm">
                <Shield size={14} className="text-red-600 shrink-0" />
                <span>Organización No Gubernamental · Ley N° 20.500[cite: 16]</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.05]">
                Preparados para responder, <span className="text-red-600">comprometidos con la vida</span>[cite: 16].
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 font-semibold leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Especialistas en búsqueda, rescate y protección civil[cite: 16]. Articulamos recursos tácticos y talento humano altamente capacitado para salvaguardar a la comunidad en situaciones de emergencia y desastres naturales en la Región del Biobío y el país[cite: 16].
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/postular"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl shadow-red-950/60 transition-colors"
                >
                  <span>Postular al Voluntariado</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/apoyo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-neutral-700 hover:border-white px-8 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-colors"
                >
                  <span>Solicitar Apoyo</span>
                </Link>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-amber-400" />
                  <span>Respuesta Rápida</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-amber-400" />
                  <span>Acreditación Terrestre</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-amber-400" />
                  <span>Apoyo Humanitario</span>
                </div>
              </div>

            </div>

            {/* Columna de Emblema Oficial */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-neutral-900 border-4 border-amber-400 p-5 shadow-2xl flex items-center justify-center group">
                <div className="absolute inset-0 rounded-full border-2 border-red-600/60 animate-pulse pointer-events-none" />
                <img
                  src="/logo-bre.png"
                  alt="Escudo Oficial O.N.G. BRE BIO BIO"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
              <div className="mt-6 text-center">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
                  Región del Biobío · Chile[cite: 16]
                </span>
                <p className="text-xs text-neutral-400 mt-1 font-bold">
                  Búsqueda · Rescate · Emergencia[cite: 16]
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SECCIÓN DE ESPECIALIDADES / ÁMBITOS DE ACCIÓN */}
      <section className="py-20 bg-neutral-900/40 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
              Capacidades Operativas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Ámbitos de Acción Institucional
            </h2>
            <p className="text-sm font-semibold text-neutral-400 leading-relaxed">
              Protocolos normalizados bajo estrictos estándares de seguridad para la intervención en escenarios complejos[cite: 16].
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="bg-neutral-900 border-2 border-neutral-800 p-7 rounded-xl hover:border-amber-400 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-red-950/80 border border-red-600/50 text-red-500 flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Compass size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">Búsqueda y Rescate</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                Operaciones coordinadas en áreas urbanas, rurales y zonas agrestes de difícil acceso (montañas y cuerpos de agua)[cite: 16].
              </p>
            </div>

            <div className="bg-neutral-900 border-2 border-neutral-800 p-7 rounded-xl hover:border-amber-400 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-amber-950/80 border border-amber-600/50 text-amber-400 flex items-center justify-center mb-5 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                <Activity size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">Respuesta Rápida</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                Movilización inmediata ante desastres naturales como sismos, inundaciones e incendios forestales en colaboración con estamentos públicos[cite: 16].
              </p>
            </div>

            <div className="bg-neutral-900 border-2 border-neutral-800 p-7 rounded-xl hover:border-amber-400 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-red-950/80 border border-red-600/50 text-red-500 flex items-center justify-center mb-5 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <HeartHandshake size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">Asistencia Humanitaria</h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                Provisión de apoyo logístico, primeros auxilios en el punto del incidente y distribución de recursos esenciales a comunidades afectadas[cite: 16].
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. BLOQUE DE TRANSPARENCIA Y RESPALDO LEGAL */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                  Marco Legal e Identidad
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  Institución regida bajo la Ley N° 20.500[cite: 16]
                </h2>
                <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                  Nuestra organización opera bajo estrictos principios de voluntariado, transparencia y rigor técnico. Cada miembro activo cuenta con registro verificado y credencial digital oficial para el control y validación de autoridades en terreno.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-xl">
                  <span className="block text-2xl font-black text-amber-400 mb-1">Ley N° 20.500</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Personalidad Jurídica</span>
                </div>
                <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-xl">
                  <span className="block text-2xl font-black text-red-600 mb-1">Biobío, Chile</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Jurisdicción de Origen</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}