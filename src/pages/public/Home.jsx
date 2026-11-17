import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Compass, HeartHandshake, Activity, CheckCircle, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white text-neutral-900 min-h-screen font-sans selection:bg-[#C8202F] selection:text-white">

      {/* 1. SECCIÓN HERO (PORTADA PRINCIPAL) */}
      <section className="relative bg-neutral-50 border-b-2 border-neutral-200 overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Columna de Texto Principal */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border-2 border-neutral-300 text-neutral-800 text-xs font-black uppercase tracking-widest shadow-md">
                <Shield size={16} className="text-[#C8202F] shrink-0" strokeWidth={2.5} />
                <span>Organización No Gubernamental · Ley N° 20.500[cite: 16]</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.08] text-neutral-900">
                Preparados para responder, <span className="text-[#C8202F]">comprometidos con la vida</span>[cite: 16].
              </h1>

              <p className="text-base sm:text-lg text-neutral-700 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Especialistas en búsqueda, rescate y protección civil[cite: 16]. Articulamos recursos tácticos y talento humano altamente capacitado para salvaguardar a la comunidad en situaciones de emergencia y desastres naturales[cite: 16].
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                {/* Botón principal en Amarillo Táctico con borde y texto negro */}
                <Link
                  to="/postular"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#F2B632] hover:bg-[#e0a628] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-500/20 border-2 border-black transition-all transform hover:-translate-y-0.5"
                >
                  <span>Postular al Voluntariado</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </Link>

                {/* Botón secundario limpio */}
                <Link
                  to="/apoyo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-300 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition-all"
                >
                  <span>Solicitar Apoyo</span>
                </Link>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-extrabold text-neutral-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#C8202F]" strokeWidth={2.5} />
                  <span>Respuesta Rápida[cite: 16]</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-[#C8202F]" strokeWidth={2.5} />
                  <span>Acreditación Oficial</span>
                </div>
              </div>

            </div>

            {/* Emblema Institucional (Contenedor redondeado con semi-sombra) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-72 h-72 sm:w-84 sm:h-84 rounded-3xl bg-white border-4 border-[#F2B632] p-6 shadow-2xl shadow-neutral-300 flex items-center justify-center group">
                <div className="absolute inset-0 rounded-3xl border-2 border-[#C8202F]/30 pointer-events-none" />
                <img
                  src="/logo-bre.png"
                  alt="Escudo Oficial O.N.G. BRE BIO BIO"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div className="mt-6 text-center">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C8202F]">
                  Región del Biobío · Chile[cite: 16]
                </span>
                <p className="text-xs text-neutral-500 mt-1 font-bold">
                  Búsqueda · Rescate · Emergencia[cite: 16]
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SECCIÓN DE ESPECIALIDADES (Tarjetas redondeadas y semi-sombra tipo RENAP) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C8202F] bg-red-50 px-4 py-1.5 rounded-full border border-red-200">
              Capacidades Operativas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
              Ámbitos de Acción Institucional
            </h2>
            <p className="text-sm font-bold text-neutral-600 leading-relaxed">
              Protocolos normalizados bajo estrictos estándares de seguridad para la intervención en escenarios complejos[cite: 16].
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Tarjeta 1 */}
            <div className="bg-white border-2 border-neutral-200 p-8 rounded-3xl shadow-xl shadow-neutral-200/60 hover:border-[#F2B632] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-200 text-[#C8202F] flex items-center justify-center mb-6 group-hover:bg-[#C8202F] group-hover:text-white transition-all shadow-inner">
                <Compass size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide text-neutral-900 mb-3">Búsqueda y Rescate</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                Operaciones coordinadas en áreas urbanas, rurales y zonas agrestes de difícil acceso (montañas y cuerpos de agua)[cite: 16].
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white border-2 border-neutral-200 p-8 rounded-3xl shadow-xl shadow-neutral-200/60 hover:border-[#F2B632] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-yellow-50 border-2 border-yellow-200 text-[#F2B632] flex items-center justify-center mb-6 group-hover:bg-[#F2B632] group-hover:text-black transition-all shadow-inner">
                <Activity size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide text-neutral-900 mb-3">Respuesta Rápida</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                Movilización inmediata ante desastres naturales como sismos, inundaciones e incendios forestales en colaboración con estamentos públicos[cite: 16].
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white border-2 border-neutral-200 p-8 rounded-3xl shadow-xl shadow-neutral-200/60 hover:border-[#F2B632] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-200 text-[#C8202F] flex items-center justify-center mb-6 group-hover:bg-[#C8202F] group-hover:text-white transition-all shadow-inner">
                <HeartHandshake size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wide text-neutral-900 mb-3">Asistencia Humanitaria</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                Provisión de apoyo logístico, primeros auxilios en el punto del incidente y distribución de recursos esenciales a comunidades afectadas[cite: 16].
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. BLOQUE DE TRANSPARENCIA Y RESPALDO LEGAL */}
      <section className="py-20 bg-neutral-100 border-t-2 border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-2 border-neutral-300 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-neutral-300/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-100/60 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-widest text-[#C8202F] bg-red-50 px-3.5 py-1.5 rounded-lg border border-red-200 inline-block">
                  Marco Legal e Identidad
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900">
                  Institución regida bajo la Ley N° 20.500[cite: 16]
                </h2>
                <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                  Nuestra organización opera bajo estrictos principios de voluntariado, transparencia y rigor técnico. Cada miembro activo cuenta con registro verificado y credencial digital oficial para el control y validación de autoridades en terreno.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-50 border-2 border-neutral-200 p-6 rounded-2xl shadow-md">
                  <span className="block text-xl font-black text-[#C8202F] mb-1">Ley N° 20.500[cite: 16]</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-600">Personalidad Jurídica</span>
                </div>
                <div className="bg-neutral-50 border-2 border-neutral-200 p-6 rounded-2xl shadow-md">
                  <span className="block text-xl font-black text-[#F2B632] mb-1">Biobío, Chile[cite: 16]</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-600">Jurisdicción de Origen</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}