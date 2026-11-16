import { Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-4 border-red-600 bg-black py-10 text-center">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

      <div className="container relative z-10 mx-auto flex flex-col items-center px-4">
        <h4 className="mb-1 text-xl font-bold tracking-[0.2em] text-white">
          ONG BRE BÍO BÍO
        </h4>
        <p className="mb-6 text-sm font-semibold tracking-[0.3em] text-gray-400">
          SERVICIO Y VOCACIÓN
        </p>

        <div className="mb-8 flex gap-6">
          <a
            href="#"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white transition-all hover:border-red-600 hover:bg-red-600"
          >
            <Instagram size={20} />
          </a>
          <a
            href="#"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white transition-all hover:border-red-600 hover:bg-red-600"
          >
            <Facebook size={20} />
          </a>
          <a
            href="mailto:contacto@brebiobio.cl"
            aria-label="Correo"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white transition-all hover:border-red-600 hover:bg-red-600"
          >
            <Mail size={20} />
          </a>
        </div>

        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Plataforma BRE Biobío. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
