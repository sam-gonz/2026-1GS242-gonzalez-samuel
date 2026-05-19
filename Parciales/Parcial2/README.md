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

## 🏗️ Plan de Desarrollo por Fases

### Fase 1 — Fundaciones del Proyecto

**Objetivo:** dejar la base técnica lista para construir sin retrabajo posterior.

- [ ] Inicializar el proyecto con Bun
- [ ] Configurar TanStack Start para frontend
- [ ] Configurar Hono para backend/API
- [ ] Crear `docker-compose.yml` con `app` y `mongodb`
- [ ] Conectar la aplicación a MongoDB
- [ ] Definir variables de entorno y estructura inicial del proyecto
- [ ] Crear las carpetas base para `server`, `client`, `models`, `routes`, `engine` y `seed`

---

### Fase 2 — Ingesta y Persistencia de Datos

**Objetivo:** tener la base de datos poblada con información real desde PokéAPI, sin hardcodear data.

- [ ] Crear modelo `Pokemon`
- [ ] Crear modelo `Move`
- [ ] Crear modelo `TypeChart`
- [ ] Consumir `GET https://pokeapi.co/api/v2/pokemon?limit=300&offset=0`
- [ ] Importar al menos 300 Pokémon en MongoDB
- [ ] Guardar por cada Pokémon: `id`, `name`, `types`, `baseStats`, `spriteUrl`, `moveIds[]`
- [ ] Guardar movimientos con `name`, `type`, `power`, `accuracy`, `priority`, `damageClass`, `effect`
- [ ] Guardar relaciones de daño por tipo desde PokéAPI
- [ ] Documentar el proceso de seed en el README
- [ ] Crear endpoint `GET /api/pokemon` para consumir catálogo desde MongoDB

---

### Fase 3 — Sistema de Salas y Flujo Pre-Batalla

**Objetivo:** permitir que dos jugadores creen o se unan a una sala y preparen la partida.

- [ ] Crear modelo `Room`
- [ ] Generar código único de sala
- [ ] Implementar `POST /api/rooms` para crear sala
- [ ] Implementar `POST /api/rooms/:code/join` para unirse a sala
- [ ] Implementar `GET /api/rooms/:code` para consultar estado de la sala
- [ ] Validar que no entren más de dos jugadores
- [ ] Crear lobby de espera mientras llega el jugador 2
- [ ] Permitir que ambos jugadores registren nombre temporal
- [ ] Preparar flujo de selección o asignación de equipo

---

### Fase 4 — Equipos y Estado Inicial de Batalla

**Objetivo:** dejar la partida lista para comenzar con reglas válidas desde el inicio.

- [ ] Crear modelo `Battle`
- [ ] Implementar `POST /api/rooms/:code/team`
- [ ] Permitir equipos de hasta 6 Pokémon por jugador
- [ ] Validar que cada Pokémon tenga exactamente 4 movimientos válidos y no repetidos
- [ ] Excluir o documentar los casos donde un Pokémon no tenga 4 movimientos válidos
- [ ] Generar IVs aleatorios al iniciar la partida
- [ ] Calcular stats de batalla a nivel 50
- [ ] Definir Pokémon activo inicial por jugador
- [ ] Guardar HP actual, estados, modificadores y equipo en el estado de batalla

#### Fórmulas de stats sugeridas
```
hp   = floor((2 * baseHp + ivHp) * 50 / 100) + 50 + 10
stat = floor((2 * baseStat + ivStat) * 50 / 100) + 5
```

---

### Fase 5 — Motor de Combate

**Objetivo:** resolver turnos completos desde el backend de forma consistente y verificable.

- [ ] Implementar `POST /api/rooms/:code/action`
- [ ] Recibir acciones tipo `move` o `switch`
- [ ] Validar que el jugador pertenece a la sala
- [ ] Validar que el Pokémon activo esté vivo
- [ ] Validar que el movimiento pertenece al Pokémon activo
- [ ] Evitar acciones duplicadas en el mismo turno
- [ ] Resolver el turno solo cuando ambos jugadores hayan enviado su acción
- [ ] Ordenar acciones por prioridad, velocidad efectiva y coin flip si es necesario
- [ ] Calcular precisión, daño, STAB, efectividad, crítico y quemadura
- [ ] Aplicar cambios de Pokémon
- [ ] Detectar debilitamiento y victoria
- [ ] Guardar cada evento en `battleLog`

#### Fórmula de daño
```
baseDamage = floor(floor(floor(2 * 50 / 5 + 2) * movePower * (attackStat / defenseStat)) / 50 + 2)
modifier    = randomFactor * stab * typeMultiplier * critical * burnModifier
finalDamage = max(1, floor(baseDamage * modifier))

randomFactor   = randomInt(85, 100) / 100
stab           = 1.5 si el tipo del movimiento coincide con el atacante, si no 1
typeMultiplier = producto de x2, x0.5, x0 o x1 según los tipos del defensor
critical       = 1.5 si random < 1/24, si no 1
burnModifier   = 0.5 si está quemado y usa movimiento físico, si no 1
```

---

### Fase 6 — Estados, Reglas y Log de Batalla

**Objetivo:** completar las mecánicas obligatorias que hacen la pelea jugable y evaluable.

- [ ] Implementar estados temporales de 3 turnos
- [ ] Mostrar en log cuándo un ataque fue súper efectivo, poco efectivo o no tuvo efecto
- [ ] Reducir velocidad por parálisis si se implementa
- [ ] Aplicar daño pasivo por quemadura o veneno
- [ ] Eliminar estado y modificadores al cambiar o retirar Pokémon
- [ ] Registrar claramente turnos, efectos, cambios y KO en el log

---

### Fase 7 — Frontend y Diseño Visual

**Objetivo:** construir una interfaz clara, memorable y coherente con el proyecto, usando el enfoque del `SKILL.md` para todo el diseño frontend.

#### Dirección estética definida con SKILL.md
**Concepto:** `Retro Game Card — Dark Arena`

- **Tono:** retro-futurista oscuro, estilo arcade táctico con energía de batalla
- **Identidad visual:** mezcla entre Pokédex clásica, HUD de combate y tarjeta coleccionable digital
- **Tipografía:** `Press Start 2P` para títulos y elementos clave, `IBM Plex Mono` para logs, stats y texto funcional
- **Colores:** `#0a0a0f` como base, `#FFD700` para acentos principales, `#EF4444` para daño, `#22C55E` para vida
- **Fondos:** mesh oscuro, textura sutil, patrones pixel-grid y brillos controlados
- **Movimiento:** animaciones puntuales de alto impacto, sin llenar la interfaz de efectos innecesarios
- **Regla visual clave:** usar solo sprites 2D consistentes; no mezclar estilos incompatibles

#### Pantallas a implementar
- [ ] Pantalla de inicio para crear sala o unirse con código
- [ ] Lobby de espera con código visible y estado del segundo jugador
- [ ] Pantalla de selección de equipo con grid, filtros y feedback visual
- [ ] Pantalla de batalla con sprites, barras de vida, tipos, estados y 4 movimientos
- [ ] Panel de cambio de Pokémon
- [ ] Log de batalla visible y scrolleable
- [ ] Pantalla final de victoria o derrota

#### Componentes visuales clave
- [ ] `PokemonCard`
- [ ] `HealthBar`
- [ ] `MoveButton`
- [ ] `TypeBadge`
- [ ] `StatusBadge`
- [ ] `BattleLog`

---

### Fase 8 — Sincronización, Integración y Demo

**Objetivo:** dejar el sistema funcional de punta a punta para pruebas y presentación.

- [ ] Actualizar estado de batalla con polling, refetch, SSE o WebSockets
- [ ] Manejar errores de sala inválida, acciones repetidas o equipo incorrecto
- [ ] Verificar que dos navegadores puedan completar una partida completa
- [ ] Confirmar que la partida puede terminar con victoria o derrota
- [ ] Validar que Docker levante correctamente el proyecto completo
- [ ] Completar README final con instrucciones, reglas implementadas, seed y limitaciones conocidas

---

### Fase 9 — Mejores Opcionales

**Objetivo:** agregar mejoras si ya todo lo obligatorio está sólido.

- [ ] Orden de turnos por prioridad + velocidad efectiva
- [ ] Filtros por nombre o tipo en selección
- [ ] Reconexión de sala al refrescar
- [ ] Historial o replay simple
- [ ] Temporizador por turno
- [ ] Sistema de clima o campo
- [ ] Baneo de Pokémon antes de iniciar

---

## 📁 Estructura de Carpetas Sugerida

```
Parcial2/
├── docker-compose.yml
├── README.md
├── app/
│   ├── package.json
│   ├── src/
│   │   ├── server/
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
│   │   │   │   ├── damage.ts
│   │   │   │   ├── status.ts
│   │   │   │   └── turn.ts
│   │   │   └── seed/
│   │   │       └── importPokemon.ts
│   │   └── client/
│   │       ├── routes/
│   │       │   ├── index.tsx
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
│   │           ├── globals.css
│   │           └── battle.css
```

---

## 🗄️ Modelos de Base de Datos

### Pokemon
```ts
{
  pokedexId: number,
  name: string,
  types: string[],
  baseStats: {
    hp: number,
    attack: number,
    defense: number,
    specialAttack: number,
    specialDefense: number,
    speed: number
  },
  spriteUrl: string,
  moveIds: string[]
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
  effect: string | null
}
```

### Room
```ts
{
  code: string,
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
    team: BattlePokemon[],
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
cd Parciales/Parcial2
docker-compose up --build
docker exec -it pokemon-app bun run src/server/seed/importPokemon.ts
http://localhost:3000
```

---

## 🔗 Fuentes
- [PokéAPI Docs v2](https://pokeapi.co/docs/v2)
- [TanStack Start](https://tanstack.com/start)
- [Hono — Bun](https://hono.dev/docs/getting-started/bun)
- [MongoDB Docs](https://www.mongodb.com/docs/)
