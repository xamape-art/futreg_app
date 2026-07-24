# Prompt para Claude Code

Copia y pega este prompt en Claude Code (dentro de la carpeta donde quieras crear el proyecto).
Junto a este archivo tienes `README.md` (especificación completa) y `design_reference/` (el prototipo HTML de referencia).

---

Quiero construir una **web app móvil para registrar acciones de un partido de fútbol** en directo desde la banda. Adjunto en esta misma carpeta un prototipo de referencia en HTML (`design_reference/Registro Partido.dc.html`) y una especificación detallada (`README.md`).

**Importante:** el archivo HTML es una **referencia de diseño** (prototipo que muestra el aspecto y comportamiento deseados), NO código para copiar tal cual. Tu tarea es **recrear ese diseño en una app real**. No existe todavía un codebase, así que elige tú el stack más apropiado y créalo desde cero.

## Stack recomendado
- **React + Vite + TypeScript**
- **Tailwind CSS** para estilos
- Estado local con hooks (`useState`/`useReducer`); no hace falta backend en la v1
- **Persistencia en `localStorage`** para que no se pierdan la plantilla ni el registro al recargar
- Diseñado **mobile-first** (uso principal: teléfono en la banda, con una sola mano)

## Qué debe hacer la app (resumen — el detalle exacto está en README.md)
1. **Cronómetro por fases**: un único botón que avanza el estado del partido: `Iniciar 1ª parte → Detener → Comenzar 2ª parte → Detener → Finalizar partido → Nuevo partido`. Cuenta ascendente (mm:ss) con indicador de minuto y de estado (EN JUEGO / DESCANSO / FINALIZADO). Botón de RESET independiente.
2. **Registro de 4 acciones**: Gol, Ocasión, Tiro a puerta, Falta. Cada botón abre la pantalla de asignación.
3. **Pantalla de asignación sobre el campo** (formación 4-2-3-1 con los 11 titulares): tocar al jugador que la hizo, marcar el punto exacto en el campo, y arrastrar para dibujar la trayectoria/pase. Campo de notas libre. Guardar añade la acción con su minuto.
4. **Timeline** de acciones registradas (más reciente arriba), con marcador y contadores por tipo, y borrado individual.
5. **Pestaña "Plantilla"**: editar los 11 titulares (dorsal, nombre y foto). Las fotos aparecen en las fichas de jugador sobre el campo.
6. **Resumen exportable**: contadores + lista filtrable por **tipo de evento** y por **jugador**, con botón de copiar el resumen al portapapeles.

## Criterios de calidad
- Recréalo con **alta fidelidad**: colores, tipografía y espaciado según `README.md` (tokens incluidos).
- Objetivos táctiles mínimos de 44px; texto legible en móvil.
- Interacciones fluidas (transiciones suaves al abrir modales, feedback al pulsar).
- Código limpio y componentizado (Timer, ActionButtons, PitchAssign, Timeline, Squad, Summary).

Empieza montando el proyecto y la estructura de componentes, luego implementa el cronómetro por fases, después la pantalla del campo, y por último plantilla y resumen. Pregúntame si algo del diseño no queda claro.
