# Handoff: App de registro de acciones de partido de fútbol

## Overview
Aplicación web **móvil** para registrar en directo, desde la banda, las acciones de un partido de fútbol de un solo equipo (11 titulares). Combina un cronómetro por fases, botones de registro rápido de acciones, una pantalla de asignación sobre el campo (jugador + punto exacto + trayectoria), una plantilla editable con fotos, y un resumen exportable y filtrable.

## About the Design Files
Los archivos de `design_reference/` son una **referencia de diseño creada en HTML** — un prototipo que muestra el aspecto y comportamiento previstos, **no** código de producción para copiar directamente. La tarea es **recrear este diseño en un codebase real**. No existe aún un entorno, así que se debe **elegir el framework más apropiado e implementarlo desde cero** (recomendado: React + Vite + TypeScript + Tailwind).

`design_reference/Registro Partido.dc.html` es un "Design Component" (formato de prototipado): usa una plantilla HTML + una clase de lógica JS. Sirve como fuente de verdad del comportamiento y los estilos; no intentes reutilizar su runtime.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, espaciado e interacciones son definitivos. Recrear la UI de forma fiel usando la librería de estilos elegida. Los valores exactos están en *Design Tokens*.

## Layout general
- Contenedor de app **mobile-first**, diseñado sobre un lienzo de **390×844** (iPhone). En producción debe ser responsive y ocupar el viewport del móvil.
- Fondo general de la app: `#10131a` (casi negro azulado). Texto principal `#eef1f5`.
- **Barra de pestañas inferior fija** (64px de alto) con dos pestañas: **Partido** y **Plantilla**. Indicador de pestaña activa: borde superior de 2px en color primario y texto `#eef1f5`; inactiva texto `#6b7280`.
- Fuentes: **Barlow** (texto/UI) y **Barlow Semi Condensed** (números grandes, dorsales, títulos). Cargar desde Google Fonts.

---

## Screens / Views

### 1. Partido (pestaña principal)
**Purpose:** cronometrar el partido y registrar acciones.

**Layout (de arriba a abajo):**
- **Header** (padding 52px arriba por safe-area): logo cuadrado 34px radio 9px en color primario con la inicial del equipo en blanco (Barlow Semi Condensed 18px/800); a su lado nombre de equipo (15px/700) y `vs {rival}` (11px/500, `#7f8794`). A la derecha, botón "Resumen" (pill, borde `#2b3038`, 12px/700, `#aeb6c2`).
- **Tarjeta de cronómetro** (margen 18px, fondo degradado `#181d26→#12161d`, borde `#232935`, radio 22px, padding 18px):
  - Fila superior: dos chips indicadores de parte **1ª / 2ª** (solo lectura; el activo va con fondo `#FFD400`, texto `#111`; inactivo borde `#2b3038`, texto `#aeb6c2`). A la derecha, indicador de estado: `● EN JUEGO` (verde `#4ade80`, parpadeo), `● DESCANSO` (ámbar `#F5A623`), `● FINALIZADO` (gris `#8A94A6`). Vacío antes de empezar.
  - **Reloj**: `mm:ss`, centrado, Barlow Semi Condensed 66px/800, `font-variant-numeric: tabular-nums`.
  - Subtítulo: `minuto {n}'` (13px/600, `#7f8794`).
  - Fila de controles: **botón principal** (flex-grow, alto 46px, radio 14px, 15px/800) + botón **RESET** (52px, borde `#2b3038`, `#aeb6c2`).
- **Marcador / contadores**: grid de 4 columnas. Cada chip (fondo `#141922`, borde `#202632`, radio 14px): número grande (26px/800) en el color del tipo + etiqueta en mayúsculas (10px/700, `#8b93a0`). Tipos: **Goles**, **Ocasiones**, **Tiros**, **Faltas**.
- **Botones de acción**: rótulo "REGISTRAR ACCIÓN" (11px/700, `#6b7280`, mayúsculas) + grid 2×2 de botones (alto 58px, radio 16px, texto blanco 17px/800 Barlow Semi Condensed, sombra de color `{color}55`). Al pulsar: `transform: scale(.96)`. Abren el modal de asignación.
- **Timeline**: cabecera "TIMELINE" + contador "N acciones". Lista scrollable; **más reciente arriba**. Vacío: mensaje centrado `#4c545f`. Cada fila: minuto (40px, 17px/800 `#cfd5de`) + badge de tipo (pill con color del tipo, 11px/800) + nombre y dorsal del jugador (`Nombre · N`, 14px/700) + nota opcional (12.5px, `#8b93a0`) + botón ✕ para borrar (al pulsar se pone rojo). Animación de entrada `slideup .22s`.

**Botón principal — máquina de estados (comportamiento clave):**
| Fase | Etiqueta | Color fondo / texto | Acción al pulsar |
|------|----------|--------------------|------------------|
| `pre` | INICIAR 1ª PARTE | primario / blanco | corre reloj, parte=1, fase→`1H` |
| `1H` | DETENER | `#FFD400` / `#111` | para reloj, fase→`ht` |
| `ht` | COMENZAR 2ª PARTE | primario / blanco | corre reloj, parte=2, fase→`2H` |
| `2H` | DETENER | `#FFD400` / `#111` | para reloj, fase→`ft` |
| `ft` | FINALIZAR PARTIDO | `#E30613` / blanco | para reloj, fase→`end`, abre Resumen |
| `end` | NUEVO PARTIDO | `#39404b` / `#eef1f5` | resetea tiempo + acciones, fase→`pre` |

El reloj es **ascendente** y sigue acumulando (la 2ª parte continúa desde donde quedó). RESET vuelve a `pre` y pone el tiempo a 0 (conserva la plantilla; conserva o no las acciones según se decida — en el prototipo RESET no borra acciones y "NUEVO PARTIDO" sí).

### 2. Modal de asignación de acción
**Purpose:** asignar la acción a un jugador y ubicarla en el campo. Overlay a pantalla completa (`#0c0f14`, `slideup .24s`).

- **Header**: badge del tipo de acción + minuto actual; botón ✕ (cerrar/cancelar).
- Instrucción: "Toca al jugador · marca el punto · arrastra para la trayectoria" (12px, `#7f8794`).
- **Campo** (flex-grow, radio 14px, degradado verde `#1f9c4d→#178040`, borde interior blanco translúcido). Elementos:
  - Rayas horizontales (`repeating-linear-gradient` blanco .06 alpha).
  - Marcas: círculo central 118px, línea de medio campo, punto central, áreas grande (22%–78%, alto 15%) y pequeña (35%–65%, alto 6%) arriba y abajo. Todo con líneas blancas a .45 alpha, 2px.
  - **11 jugadores** posicionados en % (formación **4-2-3-1**, ver *Roster*). Cada ficha: círculo 32px (borde blanco; fondo = color primario, o foto si existe) con el dorsal (Barlow Semi Condensed 15px/800). Seleccionado: fondo `#FFD400`, texto `#111`, aro `0 0 0 4px rgba(255,212,0,.45)`. Debajo, etiqueta `{dorsal} {nombre}` (9.5px/700 blanco con sombra).
  - **Capa de interacción** por encima del campo (bajo las fichas): `pointerdown` fija el punto y el inicio de la trayectoria; `pointermove` (arrastrando) actualiza el extremo; `pointerup` finaliza. `touch-action: none`, `cursor: crosshair`.
  - **Overlay SVG** (`viewBox 0 0 100 100`, `preserveAspectRatio: none`, `pointer-events: none`): si el arrastre supera ~4 unidades dibuja una **flecha** amarilla (`#FFD400`) con punta (marker); si no, dibuja solo un **punto** amarillo (borde oscuro).
  - Tocar una ficha selecciona ese jugador (y detiene la propagación para no marcar punto).
- **Footer**: línea de estado (verde si hay jugador seleccionado: `Jugador: {nombre} · {dorsal}`; si no, gris `Selecciona un jugador para guardar`). **Textarea** de notas (alto 52px, fondo `#161b23`, borde `#262c37`, radio 12px). Botones: **Cancelar** (108px, borde) + **Guardar acción** (flex, color primario; deshabilitado —opacidad .7, `not-allowed`— hasta seleccionar jugador).
- Guardar: crea la acción `{ tipo, segundos(minuto), jugador, punto, trayectoria, nota }`, la añade al timeline, actualiza contadores y cierra el modal.

### 3. Plantilla (pestaña)
**Purpose:** editar los 11 titulares.
- Header: título "Plantilla" (24px/800 Barlow Semi Condensed) + subtítulo "11 titulares · toca la foto para cambiarla".
- Lista scrollable; cada fila (separador `#191e27`):
  - **Avatar** 52px circular = botón de subir foto (`<input type=file accept=image/*>` oculto). Sin foto: fondo primario con el dorsal (19px/800 blanco). Con foto: imagen `cover`. Insignia `+` amarilla (`#FFD400`, texto `#111`) abajo-derecha.
  - Campo **Dorsal**: input numérico 52px, centrado, Barlow Semi Condensed 17px/800.
  - Campo **Nombre**: input de texto flex, 15px/600.
- Los cambios (dorsal, nombre, foto) se reflejan inmediatamente en las fichas del campo.

### 4. Resumen (overlay)
**Purpose:** revisar y exportar. Overlay pantalla completa `#0c0f14`.
- Header: "Resumen del partido" + `{equipo} · vs {rival} · {minuto}'`; botón ✕ cerrar.
- Grid de 4 contadores (igual que el marcador).
- **Filtros:**
  - Fila de **chips por evento** (scroll horizontal): `Todos` (gris `#5a6470`), `Gol`, `Ocasión`, `Tiro a puerta`, `Falta`. El activo se rellena con su color; inactivo borde `#2b3038`, texto `#aeb6c2`.
  - **Desplegable por jugador**: `Todos los jugadores` + cada `{dorsal} · {nombre}`.
- Lista filtrada (misma tarjeta que el timeline). Si el filtro no devuelve nada: "Sin acciones para este filtro."
- Footer: botón **Copiar resumen** (color primario; al copiar cambia a verde `#4ade80` + "¡Copiado!" durante ~1.8s). Usa `navigator.clipboard.writeText` con un texto plano: cabecera + totales + una línea por acción `{min}' {TIPO} - {jugador} ({dorsal}) | {nota}`.

---

## Interactions & Behavior
- **Cronómetro**: `setInterval` de 1s; incrementa segundos solo cuando `running` es true. Formato `mm:ss` con dígitos tabulares. Minuto = `floor(seg/60)`.
- **Fases**: función `advance()` que transiciona según la tabla de arriba.
- **Campo**: eventos pointer (mouse + táctil). Convertir coordenadas del puntero a % relativo al rect del campo, con clamp 0–100. Distinguir punto vs. trayectoria por distancia (~4 unidades).
- **Fotos**: `FileReader.readAsDataURL` → guardar dataURL en el jugador.
- **Copiar**: clipboard API con feedback temporal.
- **Transiciones**: overlays con animación `slideup` (~.24s ease); filas de timeline `slideup .22s`; botones de acción `scale(.96)` al pulsar; indicador EN JUEGO con parpadeo (`blink 1.4s infinite`).
- Objetivos táctiles ≥44px; el reloj y los botones grandes priorizan el uso con una mano.

## State Management
Estado sugerido (por ejemplo un `useReducer` o store ligero):
- `phase`: `'pre'|'1H'|'ht'|'2H'|'ft'|'end'`
- `running`: boolean, `seconds`: number, `half`: 1|2
- `roster`: `Array<{ id, n(dorsal), name, x, y, photo|null }>` (x/y en % para la formación)
- `actions`: `Array<{ id, type, seconds, player:{id,n,name}, point:{x,y}|null, drag:{x0,y0,x1,y1}|null, note }>`
- Estado del modal: `modalOpen`, `pendingType`, `selPlayer`, `point`, `drag`, `note`
- Estado del resumen: `showSummary`, `sumType` (filtro evento), `sumPlayer` (filtro jugador), `copied`
- `tab`: `'partido'|'plantilla'`
- **Persistir `roster` y `actions` (y opcionalmente el estado del partido) en `localStorage`.**
- Sin data fetching en la v1.

## Design Tokens
**Colores**
- Fondo app: `#10131a` · Overlays: `#0c0f14`
- Superficies/tarjetas: `#141922`, `#161b23`, `#181d26`, `#12161d`
- Bordes: `#191e27`, `#202632`, `#232935`, `#262c37`, `#2b3038`
- Texto: primario `#eef1f5`, secundario `#aeb6c2` / `#8b93a0` / `#7f8794`, tenue `#6b7280` / `#5a626d` / `#4c545f`
- **Primario (equipo, configurable):** `#E30613` (opciones: `#005BAC`, `#0A7E3D`, `#111827`)
- Acento selección: `#FFD400` (texto sobre él `#111`)
- Verde "en juego": `#4ade80` · Campo: `#1f9c4d`→`#178040`
- Colores de tipo de acción: Gol `#E30613`, Ocasión `#F5A623`, Tiro a puerta `#2D9CDB`, Falta `#8A94A6`

**Tipografía**
- UI/texto: **Barlow** (400/500/600/700/800)
- Números/títulos: **Barlow Semi Condensed** (600/700/800)
- Escala usada: reloj 66px · título plantilla 24px · contadores 26px · dorsal ficha 15px · nombre input 15px · notas/etiquetas 11–13px

**Radios:** 9–10px (chips/botones pequeños), 11–16px (inputs/botones), 22px (tarjeta cronómetro), 50% (avatares/fichas).
**Sombras:** botones de acción `0 6px 16px {color}55`; tarjetas y overlays sombras suaves oscuras.
**Espaciado:** paddings de contenido 18px laterales; gaps 8–13px; safe-area superior ~50–52px.

## Assets
- **Fuentes:** Barlow y Barlow Semi Condensed (Google Fonts).
- **Fotos de jugadores:** las sube el usuario (no hay assets incluidos). En el prototipo se usa el dorsal como marcador por defecto.
- **Logo:** placeholder con la inicial del equipo. Si el equipo real tiene escudo/branding, usar el sistema de marca del propio codebase.
- No hay iconografía externa; los pocos glifos usados son texto (`+`, `✕`, `●`).

## Roster de ejemplo (4-2-3-1) — posiciones x/y en %
| id | dorsal | nombre | x | y |
|----|--------|--------|---|---|
| 1 | 1 | Asier | 50 | 90 |
| 2 | 2 | Unai | 15 | 73 |
| 3 | 3 | Pedro | 38 | 76 |
| 4 | 4 | Germán | 62 | 76 |
| 5 | 5 | Manuel | 85 | 73 |
| 6 | 6 | López | 34 | 56 |
| 7 | 8 | Manolo | 66 | 56 |
| 8 | 7 | Salinas | 18 | 36 |
| 9 | 10 | Pedrosa | 50 | 33 |
| 10 | 11 | Jaime | 82 | 36 |
| 11 | 9 | Julian | 50 | 14 |

(y=90 es la portería propia abajo; el ataque va hacia arriba, y=14.)

## Files
- `design_reference/Registro Partido.dc.html` — prototipo completo (plantilla HTML + clase de lógica JS). Fuente de verdad del diseño y el comportamiento.
- `PROMPT.md` — prompt listo para pegar en Claude Code.
