# futreg_app

App web móvil para registrar en directo las acciones de un partido de fútbol: cronómetro por fases, registro de Gol / Ocasión / Tiro a puerta / Falta con jugador y punto sobre el campo, timeline, plantilla editable e histórico de partidos.

**En producción:** https://xamape-art.github.io/futreg_app/

## Contenido del repo

| Ruta | Qué es |
|---|---|
| [`registro-partido/`](registro-partido/) | La app (React + TypeScript + Vite + Tailwind). Ver su [README](registro-partido/README.md). |
| [`supabase/schema.sql`](supabase/schema.sql) | Esquema, políticas RLS y bucket de fotos. Se ejecuta en el SQL Editor de Supabase. |
| [`design_handoff_registro_partido/`](design_handoff_registro_partido/) | Referencia de diseño original. |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | Build y publicación en GitHub Pages en cada push a `main`. |

## Puesta en marcha

```bash
cd registro-partido
npm install
npm run dev
```

La app funciona sin configurar nada: guarda en `localStorage` del navegador. Para activar el guardado en la nube (histórico de partidos, varios dispositivos, fotos de jugadores), sigue la sección *Supabase* del [README de la app](registro-partido/README.md#supabase-opcional).
