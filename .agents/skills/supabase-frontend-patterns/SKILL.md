---
name: supabase-frontend-patterns
description: >-
  Patrones seguros de integración frontend con Supabase Auth, PostgreSQL (RLS),
  Storage y Realtime v2 para la plataforma de la O.N.G. BRE BIO BIO.
---

# Patrones Frontend con Supabase

## Autenticación y Control de Acceso
- Usa `useAuth()` desde `src/context/AuthContext.jsx` para acceder a `{ user, profile, loading, signOut }`.
- Protege las rutas privadas con `<RutaProtegida rolesPermitidos={[...]}>` en `src/App.jsx`.
- Verifica `estado_validacion === 'pendiente'` antes de exponer funcionalidades operativas en `/mi-perfil` o `/panel`.

## Consultas, Storage y Realtime v2
- Para suscripciones en tiempo real usa la sintaxis de `@supabase/supabase-js` v2:
  ```js
  const channel = supabase
    .channel('nombre_canal')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tabla' }, handler)
    .subscribe();
  ```
  Y limpia siempre con `supabase.removeChannel(channel)` en el `return` del `useEffect`.
- Al subir archivos a Storage (`certificados`), construye rutas únicas con `${profile.id}/${Date.now()}.${fileExt}` y valida errores de bucket inexistente o permisos RLS.
- Mantén sincronizado `supabase/schema.sql` cada vez que agregues o modifiques columnas, triggers o políticas RLS en el frontend.

