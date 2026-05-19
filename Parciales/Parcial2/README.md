# 🎮 Pokémon Battle Rooms — Parcial 2

> **Curso:** Desarrollo de Software · **Modalidad:** Individual · **Duración:** 1 semana
> **Docente:** Erick Vicente Agrazal Lopez · **Estudiante:** Samuel González

---

## 📋 Descripción

Aplicación web full-stack de batallas Pokémon **1P vs 1P** mediante salas con código compartido. Los datos se importan desde **PokéAPI** y se persisten en **MongoDB**. El backend resuelve todos los turnos de combate; el frontend solo envía decisiones y renderiza el estado.

---

## 🗂️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | TanStack Start + React |
| Runtime | Bun |
| Backend/API | Hono |
| Base de datos | MongoDB + Mongoose |
| Infraestructura | Docker + Docker Compose |
| Datos externos | PokéAPI v2 |

---

## 🚀 Cómo correr el proyecto

```bash
# 1. Ir a la carpeta del proyecto
cd Parciales/Parcial2

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar con Docker Compose
docker-compose up --build

# 4. En otra terminal, correr el seed (solo la primera vez)
docker exec -it pokemon-app bun run seed

# 5. Abrir en navegador
# http://localhost:3000
```

---

## 🏗️ Plan de Desarrollo por Fases

### Fase 1 — Fundaciones del Proyecto
- [x] Bun + Hono + TanStack Start configurados
- [x] Docker Compose con `app` y `mongodb`
- [x] Conexión a MongoDB con Mongoose
- [x] Variables de entorno documentadas
- [x] Estructura de carpetas definida

### Fase 2 — Ingesta y Persistencia de Datos
- [x] Modelos: `Pokemon`, `Move`, `TypeChart`, `Room`, `Battle`
- [x] Script seed que importa 300+ Pokémon desde PokéAPI
- [x] Importación de movimientos y relaciones de tipo
- [x] `GET /api/pokemon` con paginación y filtros

### Fase 3 — Sistema de Salas
- [x] `POST /api/rooms` — crear sala con código único
- [x] `POST /api/rooms/:code/join` — segundo jugador se une
- [x] `GET /api/rooms/:code` — estado de sala (lobby)
- [x] `POST /api/rooms/:code/team` — selección de equipo + inicio de batalla

### Fase 4 — Motor de Combate
- [x] `engine/damage.ts` — fórmula completa con STAB, tipos, críticos, quemadura
- [x] `engine/status.ts` — estados temporales de 3 turnos, daño pasivo
- [x] `engine/turn.ts` — resolución de turno, orden por prioridad/velocidad/coin flip
- [x] `POST /api/battle/:code/action` — recibe y valida acciones, resuelve turno
- [x] `GET /api/battle/:code` — estado completo de batalla

### Fase 5 — Frontend: Home, Lobby y Team Select
- [x] `globals.css` — diseño Retro Dark Arena con `Press Start 2P` + `IBM Plex Mono`
- [x] `index.tsx` — pantalla de crear/unirse a sala
- [x] `lobby.$code.tsx` — espera con código animado y polling
- [x] `select.$code.tsx` — grid de Pokémon con filtros y selección de equipo

### Fase 6 — Pantalla de Batalla y Componentes
- [x] `battle.css` — layout de arena, animaciones de ataque/daño/debilitamiento
- [x] `battle.$code.tsx` — pantalla completa con sprites, HP bars, movimientos, switch, log
- [x] Componentes: `PokemonCard`, `HealthBar`, `TypeBadge`, `StatusBadge`, `BattleLog`
- [x] Pantalla de victoria/derrota

---

## 🗄️ Reglas implementadas

- Daño calculado exclusivamente en el backend
- Efectividad por tipo obtenida desde PokéAPI (sin hardcodeo)
- STAB x1.5 si el tipo del movimiento coincide con el atacante
- Golpe crítico: probabilidad 1/24, multiplicador x1.5
- Estados temporales duran 3 turnos y se eliminan al cambiar Pokémon
- Orden de turno: prioridad del movimiento → velocidad efectiva → coin flip
- Parálisis reduce velocidad a la mitad
- Quemadura reduce daño físico a la mitad y aplica 5% HP por turno
- Veneno aplica 5% HP de daño pasivo por turno

---

## ⚠️ Limitaciones conocidas

- No se implementa reconexion a sala al refrescar (opcional)
- Los Pokémon con menos de 4 movimientos válidos usan los disponibles
- No hay sistema de objetos ni clima (opcionales)

---

## 🔗 Fuentes
- [PokéAPI Docs v2](https://pokeapi.co/docs/v2)
- [TanStack Start](https://tanstack.com/start)
- [Hono — Bun](https://hono.dev/docs/getting-started/bun)
- [MongoDB Docs](https://www.mongodb.com/docs/)
