---
name: react-tailwind-architecture
description: >-
  Estándares profesionales de ingeniería frontend para React 18, Vite y
  Tailwind CSS v3. Úsalo al refactorizar componentes, optimizar rendimiento,
  asegurar accesibilidad o agregar nuevas rutas y vistas.
---

# Arquitectura Frontend React + Vite + Tailwind v3

## Convenciones de Tailwind CSS v3
- Usa únicamente utilidades válidas de Tailwind v3 (por ejemplo `w-12 h-12` o valores arbitrarios `w-[52px] h-[52px]`; evitar clases inexistentes como `w-13`).
- Mantén diseño mobile-first (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) y evita desbordamientos horizontales (`overflow-x-hidden` en contenedores raíz de landing).

## Calidad de Componentes React
- Separa lógica de datos (hooks/servicios) de la presentación cuando un componente supere ~200 líneas.
- Limpia siempre suscripciones y efectos asíncronos (`let mounted = true` / `return () => { mounted = false; ... }`).
- Maneja explícitamente los tres estados en toda vista con datos remotos: `loading`, `error` y estado vacío (`empty state`).

## Accesibilidad y Formularios
- Todo `<button>` de solo icono y enlace de red social debe incluir `aria-label`.
- Los formularios deben deshabilitar el botón de envío mientras `submitting` es `true` (`disabled={submitting}`) y mostrar retroalimentación clara de éxito o error.
- Verifica que todo icono importado desde `lucide-react` exista en la versión instalada antes de usarlo.

## Activos y Galería Automática
- Las imágenes estáticas institucionales van en `public/` (`/logo-bre.png`, `/directorio/*.jpg`).
- Las fotografías de terreno van en `src/assets/terreno/` y se consumen mediante `import.meta.glob` en `src/utils/galeriaAutomatica.js`.

