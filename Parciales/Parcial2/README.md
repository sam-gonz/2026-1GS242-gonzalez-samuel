# 🎮 Pokémon Battle Rooms — Parcial 2

> **Curso:** Desarrollo de Software · **Modalidad:** Individual · **Duración:** 1 semana  
> **Docente:** Erick Vicente Agrazal Lopez · **Estudiante:** Samuel González

---

## 📋 Descripción

Aplicación web full-stack de batallas Pokémon **1P vs 1P** mediante salas con código compartido. Los datos se importan desde **PokéAPI** y se persisten en **MongoDB**. El backend resuelve todos los turnos de combate, el frontend solo envía decisiones y renderiza el estado.

---

## 🗂️ Stack Tecnológico Obligatorio

| Capa | Tecnología |
|---|---|
| Frontend | TanStack Start |
| Runtime | Bun |
| Backend/API | Hono |
| Base de datos | MongoDB |
| Infraestructura | Docker + Docker Compose |
| Datos externos | PokéAPI v2 |

---

## 🏗️ Plan de Desarrollo

### Día 1 — Setup e Importación de Datos

**Objetivo:** Proyecto corriendo con Docker, Bun + Hono + MongoDB conectados, y 300+ Pokémon importados.

- [ ] Inicializar proyecto con `bun init`, instalar Hono, mongoose/mongodb driver
- [ ] Crear `docker-compose.yml` con servicios: `app` y `mongodb`
- [ ] Conectar Hono a MongoDB
- [ ] Crear modelos: `Pokemon`, `Move`, `TypeChart`
- [ ] Crear script de seed que consuma PokéAPI:
  - `GET https://pokeapi.co/api/v2/pokemon?limit=300&offset=0`
  - Para cada Pokémon: guardar `id`, `name`, `types`, `baseStats`, `spriteUrl`, `moveIds[]`
  - Para cada movimiento relevante: `name`, `type`, `power`, `accuracy`, `priority`, `damageClass`, `effect`
  - Relaciones de daño entre tipos desde `GET /api/v2/type/{id}`
- [ ] Documentar seed en README (cómo correrlo)
- [ ] Endpoint `GET /api/pokemon` funcional con datos desde MongoDB

---

### Día 2 — Sistema de Salas y Modelos de Batalla

**Objetivo:** Crear sala → generar código → segundo jugador se une → lobby funcional.

- [ ] Modelo `Room`: `{ code, status: 'waiting'|'selecting'|'battle'|'ended', players: [], createdAt }`
- [ ] Modelo `Battle`: `{ roomCode, turn, status, players: [{ name, team, activePokemonId, selectedAction }], battleLog, winnerPlayerId }`
- [ ] Endpoints backend:
  - `POST /api/rooms` → crea sala, genera código único (nanoid 6 chars)
  - `POST /api/rooms/:code/join` → segundo jugador se une
  - `GET /api/rooms/:code` → estado actual (polling / SSE)
- [ ] Lógica de validación de sala (no más de 2 jugadores, sala no repetida)

---

### Día 3 — Selección de Equipo y Motor de Batalla (Core)

**Objetivo:** Seleccionar equipo de hasta 6 Pokémon y ejecutar turnos con daño real.

- [ ] Endpoint `POST /api/rooms/:code/team` → guardar equipo del jugador (hasta 6 Pokémon con exactamente 4 movimientos c/u)
- [ ] Generar IVs aleatorios al iniciar partida (guardados en estado de batalla, no recalculados)
- [ ] Calcular stats de batalla nivel 50:
  ```
  hp  = floor((2 * baseHp  + ivHp)  * 50 / 100) + 50 + 10
  stat = floor((2 * baseStat + ivStat) * 50 / 100) + 5
  ```
- [ ] Endpoint `POST /api/rooms/:code/action` → recibe acción del jugador (`{ type: 'move'|'switch', moveId/pokemonId }`)
- [ ] Motor de turno (se resuelve cuando ambos jugadores enviaron acción):
  1. Validar acciones (jugador en sala, Pokémon vivo, movimiento del Pokémon)
  2. Ordenar por prioridad de movimiento → velocidad efectiva → coin flip
  3. Calcular daño con la fórmula completa
  4. Aplicar estados temporales (3 turnos, se eliminan al cambiar)
  5. Actualizar HP, detectar debilitados
  6. Detectar victoria (todos los Pokémon de un jugador con HP ≤ 0)
  7. Guardar en `battleLog`

#### Fórmula de Daño
```
baseDamage = floor(floor(floor(2 * 50 / 5 + 2) * movePower * (attackStat / defenseStat)) / 50 + 2)
modifier    = randomFactor * stab * typeMultiplier * critical * burnModifier
finalDamage = max(1, floor(baseDamage * modifier))

randomFactor  = randomInt(85, 100) / 100
STAB          = 1.5 si tipo movimiento ∈ tipos del atacante, sino 1
typeMultiplier = Producto de multiplicadores x2 / x0.5 / x0 / x1 por cada tipo del defensor
critical      = 1.5 si random < 1/24, sino 1
burnModifier  = 0.5 si atacante quemado + movimiento físico, sino 1
```

---

### Día 4 — Frontend: Interfaz Visual (con SKILL.md)

**Objetivo:** UI completa con aesthetic retro-pixel/game-card aplicando las directrices del SKILL.md.

#### Dirección Estética: "Retro Game Card — Dark Arena"
- **Tono:** Maximalist retro-futurista, oscuro, intenso. Como si una Pokédex de los 90s se fusionara con un fighting game arcade.
- **Colores:** Fondo `#0a0a0f` (casi negro), acentos `#FFD700` (amarillo Pokémon), `#EF4444` (rojo daño), `#22C55E` (verde vida). CSS variables obligatorias.
- **Tipografía:** Display: `"Press Start 2P"` (Google Fonts, 8-bit) para títulos y UI crítica. Body: `"IBM Plex Mono"` para logs y stats — evitar Inter/Roboto/Arial completamente.
- **Fondos:** Gradient mesh oscuro con noise texture sutil. Grid pattern de píxeles en fondo de pantalla de batalla.
- **Animaciones:** CSS keyframes para shake de daño, pulse en barra de vida crítica (<20%), slide-in de log entries, bounce en Pokémon al atacar.
- **Layout:** Grid asimétrico en pantalla de batalla. Pokémon del oponente arriba-derecha, propio abajo-izquierda. Botones de movimientos en panel inferior con color por tipo.

#### Pantallas a Implementar:
- [ ] **Home** — Crear sala / Unirse con código (input grande, estilo terminal)
- [ ] **Lobby** — Esperando jugador 2, muestra código gigante con efecto glow, animación de dots "esperando..."
- [ ] **Team Select** — Grid de Pokémon con sprites, filtro por tipo/nombre, selección máx 6 con indicadores visuales
- [ ] **Battle Screen:**
  - Sprites de ambos Pokémon activos (consistentes: solo sprites 2D oficiales)
  - Barras de vida animadas con CSS transitions
  - Tipos del Pokémon como badges con color por tipo
  - 4 botones de movimiento con color del tipo del movimiento
  - Panel de cambio de Pokémon (bench visible)
  - Log de batalla scrolleable con entradas coloreadas (súper efectivo = naranja, no tuvo efecto = gris)
  - Indicador de estado (quemado 🔥, paralizado ⚡, envenenado ☠️)
- [ ] **Victory/Defeat Screen** — Pantalla final con animación

---

### Día 5 — Animaciones, Integración Final y Docker

**Objetivo:** Sistema completamente integrado, Docker funcional, demo lista.

- [ ] Animaciones de batalla: CSS shake al recibir daño, fade-out al debilitarse, slide al cambiar Pokémon
- [ ] Polling o SSE cada 1-2s para actualizar estado de batalla desde el backend
- [ ] Manejo de error: sala no encontrada, equipo inválido, acción repetida
- [ ] `docker-compose.yml` final con variables de entorno
- [ ] README final con instrucciones de instalación y run
- [ ] Prueba end-to-end: dos navegadores, crear sala, batallar hasta victoria
- [ ] Opcional: implementar prioridad de movimiento + velocidad (bonus)

---

## 📁 Estructura de Carpetas Sugerida

```
Parcial2/
├── docker-compose.yml
├── README.md
├── app/
│   ├── package.json (bun)
│   ├── src/
│   │   ├── server/         # Hono backend
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   ├── pokemon.ts
│   │   │   │   ├── rooms.ts
│   │   │   │   └── battle.ts
│   │   │   ├── models/
│   │   │   │   ├── pokemon.model.ts
│   │   │   │   ├── move.model.ts
│   │   │   │   ├── room.model.ts
│   │   │   │   └── battle.model.ts
│   │   │   ├── engine/
│   │   │   │   ├── damage.ts      # Fórmulas de daño
│   │   │   │   ├── status.ts      # Estados temporales
│   │   │   │   └── turn.ts        # Resolver turno completo
│   │   │   └── seed/
│   │   │       └── importPokemon.ts
│   │   └── client/         # TanStack Start frontend
│   │       ├── routes/
│   │       │   ├── index.tsx       # Home
│   │       │   ├── lobby.$code.tsx
│   │       │   ├── select.$code.tsx
│   │       │   └── battle.$code.tsx
│   │       ├── components/
│   │       │   ├── PokemonCard.tsx
│   │       │   ├── HealthBar.tsx
│   │       │   ├── MoveButton.tsx
│   │       │   ├── BattleLog.tsx
│   │       │   ├── StatusBadge.tsx
│   │       │   └── TypeBadge.tsx
│   │       └── styles/
│   │           ├── globals.css     # CSS variables, tokens
│   │           └── battle.css      # Animaciones de batalla
```

---

## 🗄️ Modelos de Base de Datos

### Pokemon
```ts
{
  pokedexId: number,
  name: string,
  types: string[],           // ["fire", "flying"]
  baseStats: {
    hp: number, attack: number, defense: number,
    specialAttack: number, specialDefense: number, speed: number
  },
  spriteUrl: string,         // sprite oficial 2D desde PokéAPI
  moveIds: string[]          // IDs de movimientos disponibles en PokéAPI
}
```

### Move
```ts
{
  name: string,
  type: string,
  power: number | null,
  accuracy: number | null,
  priority: number,
  damageClass: "physical" | "special" | "status",
  effect: string | null      // veneno, parálisis, quemadura, etc.
}
```

### Room
```ts
{
  code: string,              // nanoid 6 chars
  status: "waiting" | "selecting" | "battle" | "ended",
  players: [{ name: string, ready: boolean }],
  createdAt: Date
}
```

### Battle
```ts
{
  roomCode: string,
  turn: number,
  status: "selecting" | "active" | "ended",
  players: [{
    name: string,
    team: BattlePokemon[],   // con IVs generados, HP actual, modificadores
    activePokemonId: string,
    selectedAction: Action | null
  }],
  battleLog: LogEntry[],
  winnerPlayerId: string | null
}
```

---

## 🚀 Instrucciones para Correr el Proyecto

```bash
# 1. Clonar y entrar a la carpeta
cd Parciales/Parcial2

# 2. Levantar con Docker Compose
docker-compose up --build

# 3. Correr el seed de PokéAPI (primera vez)
docker exec -it pokemon-app bun run src/server/seed/importPokemon.ts

# 4. Abrir en navegador
http://localhost:3000
```

---

## 🔗 Fuentes
- [PokéAPI Docs v2](https://pokeapi.co/docs/v2)
- [TanStack Start](https://tanstack.com/start)
- [Hono — Bun](https://hono.dev/docs/getting-started/bun)
- [MongoDB Docs](https://www.mongodb.com/docs/)
