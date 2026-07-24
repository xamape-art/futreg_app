# Registro Partido

App web móvil para registrar en directo las acciones de un partido de fútbol: cronómetro por fases, registro de Gol/Ocasión/Tiro a puerta/Falta con asignación de jugador y punto sobre el campo, timeline, plantilla editable y resumen exportable.

Construida con React + Vite + TypeScript + Tailwind CSS. El estado (plantilla, acciones y estado del partido) se persiste siempre en `localStorage`, y opcionalmente se sincroniza con Supabase para tener histórico de partidos y acceso desde varios dispositivos.

## Desarrollo

```bash
npm install
npm run dev
```

## Supabase (opcional)

Sin las variables de entorno la app arranca en **modo local**: `localStorage`, sin login, exactamente como antes. Para activar la nube:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta [`../supabase/schema.sql`](../supabase/schema.sql) entero en el SQL Editor. Crea las tablas, las políticas RLS y el bucket `player-photos`.
3. Copia `.env.example` a `.env` y rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Project Settings → Data API / API Keys).
4. Para el despliegue, añade esas dos como *repository secrets* en GitHub con el mismo nombre.

La `anon key` viaja en el bundle del navegador por diseño; lo que protege los datos son las políticas RLS, que restringen cada fila a `auth.uid()`. Nunca uses aquí la `service_role`.

### Cómo sincroniza

- El reducer es la fuente de verdad: **primero se escribe en local y luego se sube**, así el cronómetro no depende de la cobertura del campo.
- Las escrituras van con *debounce* de 900 ms y encadenadas, y el reloj se vuelca cada 30 s (si no, sería una escritura por segundo).
- Al entrar, la nube solo reemplaza el partido en curso si en este dispositivo no hay nada empezado. Un partido registrado sin conexión nunca se pierde: se sube como partido nuevo.
- Las fotos van al bucket privado `player-photos` y se muestran con URLs firmadas. Antes se guardaban en base64 dentro de `localStorage`, que se llena con dos o tres fotos de móvil.

Abre `http://localhost:5173` (en el móvil real, usa el modo mobile del navegador o despliega y ábrelo desde el teléfono).

## Build de producción

```bash
npm run build
npm run preview
```

## Estructura

- `src/state.ts` — reducer con la máquina de estados del partido (fases, acciones, modal, resumen).
- `src/hooks/useMatchStore.ts` — conecta el reducer con el ticking del reloj y la persistencia en `localStorage`.
- `src/hooks/useCloud.ts` — sesión, hidratación y sincronización con Supabase.
- `src/cloud/repository.ts` — todas las consultas a Supabase (partidos, acciones, plantilla, fotos).
- `src/components/historial/` — listado de partidos guardados.
- `src/components/partido/` — cronómetro, marcador, botones de acción y timeline.
- `src/components/modal/` — modal de asignación de acción y campo interactivo (`Pitch.tsx`).
- `src/components/plantilla/` — edición de los 11 titulares.
- `src/components/summary/` — resumen filtrable y copiable al portapapeles.

Referencia de diseño original en `../design_handoff_registro_partido/`.
