# Plataforma Web — O.N.G. BRE BIO BIO

Plataforma institucional y sistema operativo interno para la **O.N.G. BRE BIO BIO** (*Búsqueda, Rescate y Emergencia*), construida con **React + Vite**, **Tailwind CSS** y **Supabase**.

## Requisitos e Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y completar las variables:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   VITE_MAPBOX_TOKEN=tu-mapbox-token
   ```
3. Ejecutar el esquema SQL [`supabase/schema.sql`](./supabase/schema.sql) en el **SQL Editor** de Supabase.
4. En **Supabase Storage**, crear un bucket público llamado `certificados` con permisos de subida para usuarios autenticados.
5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Recursos Visuales y Fotografías

- **Escudo oficial**: Colocar en `public/logo-bre.png`.
- **Fotografías del Directorio** (en `public/directorio/`):
  - `director.jpg`
  - `tesorero.jpg`
  - `secretario.jpg`
  - `director-operativo.jpg`
- **Galería automática en terreno**: Copiar cualquier imagen (`.jpg`, `.jpeg`, `.png`, `.webp`) en `src/assets/terreno/`. Vite las importa automáticamente mediante `src/utils/galeriaAutomatica.js`.

## Rutas Principales

### Portal Público
- `/` — Portada corporativa, especialidades, organigrama y galería en terreno
- `/nosotros` — Marco jurídico (Ley N° 20.500), Misión, Visión, gobernanza y organigrama
- `/apoyo` — Formulario público de solicitud de apoyo técnico u operativo
- `/postular` — Requisitos y etapas de postulación
- `/voluntario/:rut` — Ficha pública de acreditación y certificados aprobados por RUT

### Autenticación e Intranet
- `/login` — Acceso para postulantes, voluntarios y directiva
- `/registro` — Registro de nuevos postulantes
- `/mi-perfil` — Panel del voluntario (datos de ficha y carga de certificados)
- `/central-mando` — Mapa táctico Mapbox y gestión de operativos en tiempo real *(Director / Superadmin)*
- `/gestion` — Validación de certificados, ascenso de postulantes y solicitudes de apoyo *(Director / Superadmin)*
- `/inventario` — Control logístico de equipamiento *(Director / Superadmin)*

