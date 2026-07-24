# Registro Partido

App web móvil para registrar en directo las acciones de un partido de fútbol: cronómetro por fases, registro de Gol/Ocasión/Tiro a puerta/Falta con asignación de jugador y punto sobre el campo, timeline, plantilla editable y resumen exportable.

Construida con React + Vite + TypeScript + Tailwind CSS. El estado (plantilla, acciones y estado del partido) se persiste en `localStorage` del navegador.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` (en el móvil real, usa el modo mobile del navegador o despliega y ábrelo desde el teléfono).

## Build de producción

```bash
npm run build
npm run preview
```

## Estructura

- `src/state.ts` — reducer con la máquina de estados del partido (fases, acciones, modal, resumen).
- `src/hooks/useMatchStore.ts` — conecta el reducer con el ticking del reloj y la persistencia en `localStorage`.
- `src/components/partido/` — cronómetro, marcador, botones de acción y timeline.
- `src/components/modal/` — modal de asignación de acción y campo interactivo (`Pitch.tsx`).
- `src/components/plantilla/` — edición de los 11 titulares.
- `src/components/summary/` — resumen filtrable y copiable al portapapeles.

Referencia de diseño original en `../design_handoff_registro_partido/`.
