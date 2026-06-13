# Parcial 3 — Juego de Damas (Checkers) con IA

**Estudiante:** González Samuel  
**Curso:** 1GS242  
**Universidad Tecnológica de Panamá**

---

## Descripción del Proyecto

Aplicación web fullstack del juego de Damas (Checkers) con inteligencia artificial, autenticación de usuarios, sistema de pagos y ranking global. El proyecto sigue una arquitectura de **microservicios** dividida en tres servicios independientes: `backend`, `ai-service` y `frontend`.

---

## Arquitectura

```
parcial3/
├── backend/          # API REST principal (Hono + Bun + MongoDB)
├── ai-service/       # Microservicio de IA con algoritmo Minimax
├── frontend/         # Interfaz web (React + Vite)
├── tests/            # Pruebas del proyecto
├── docker-compose.yml
├── podman-start.sh
├── podman-stop.sh
└── .env.example
```

### Servicios

| Servicio | Puerto | Tecnología | Descripción |
|----------|--------|------------|-------------|
| `backend` | 3000 | Hono, Bun, Mongoose | API REST principal |
| `ai-service` | 3001 | Hono, Bun | Motor de IA con Minimax |
| `frontend` | 5173 | React, Vite, Remix | Interfaz de usuario |
| `mongodb` | 27017 | MongoDB 7 | Base de datos |

---

## Tecnologías Utilizadas

### Backend
- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [Hono](https://hono.dev/)
- **ODM:** Mongoose
- **Autenticación:** Clerk SDK
- **Pagos:** Stripe
- **Base de Datos:** MongoDB

### AI Service
- **Algoritmo:** Minimax con poda Alpha-Beta
- **Lenguaje:** TypeScript
- **Runtime:** Bun
- **Framework:** Hono

### Frontend
- **Framework:** React + Remix
- **Bundler:** Vite
- **Autenticación:** Clerk
- **Estilos:** CSS personalizado

---

## Funcionalidades

- 🎮 **Juego de Damas** completo con reglas estándar
- 🤖 **IA con Minimax** — juega contra la computadora
- 🏠 **Salas de juego** — crea o únete a partidas multijugador
- 🏆 **Ranking global** — tabla de posiciones de jugadores
- 🎨 **Skins/Temas** — personaliza las piezas y el tablero (Fichas Doradas, de Cristal, Neón; Tablero Mármol, Roble Oscuro)
- 💳 **Pagos con Stripe** — compra skins dentro del juego
- 🔐 **Autenticación con Clerk** — login seguro con gestión de sesiones

---

## Rutas de la API (Backend)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Verificar estado del servidor |
| `*` | `/api/auth` | Autenticación y usuarios |
| `*` | `/api/rooms` | Gestión de salas de juego |
| `*` | `/api/game` | Lógica del juego |
| `*` | `/api/ranking` | Ranking de jugadores |
| `*` | `/api/payments` | Pagos y compra de skins |

---

## Variables de Entorno

Copia `.env.example` a `.env` y completa los valores necesarios:

```env
MONGO_URL=mongodb://mongodb:27017/checkers
PORT=3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

> ⚠️ Nunca subas tu archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

---

## Cómo Ejecutar el Proyecto

### Con Docker Compose (recomendado)

```bash
# 1. Clonar el repositorio y entrar a la carpeta
cd Parciales/parcial3

# 2. Copiar el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus claves (Clerk, Stripe, etc.)

# 3. Levantar todos los servicios
docker compose up --build
```

Servicios disponibles:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- AI Service: http://localhost:3001
- MongoDB: mongodb://localhost:27017

### Con Podman

```bash
# Iniciar
bash podman-start.sh

# Detener
bash podman-stop.sh
```

### Desarrollo Local (sin contenedores)

```bash
# Backend
cd backend
bun install
bun run dev

# AI Service
cd ai-service
bun install
bun run dev

# Frontend
cd frontend
bun install
bun run dev
```

---

## Algoritmo Minimax (AI Service)

El servicio de IA implementa el algoritmo **Minimax con poda Alpha-Beta** para determinar el mejor movimiento posible en el juego de damas. Está separado como microservicio independiente para no bloquear el backend principal.

- `minimax.ts` — Lógica del algoritmo Minimax
- `moves.ts` — Generador de movimientos válidos
- `board.ts` — Representación y utilidades del tablero

El backend se comunica con este servicio vía HTTP interno: `http://ai-service:3001`.

---

## Skins Disponibles por Defecto

| ID | Nombre | Tipo | Precio |
|----|--------|------|--------|
| `gold-pieces` | Fichas Doradas | Piezas | $2.99 |
| `crystal-pieces` | Fichas de Cristal | Piezas | $3.99 |
| `neon-pieces` | Fichas Neón | Piezas | $4.99 |
| `marble-board` | Tablero Mármol | Tablero | $2.99 |
| `dark-wood` | Tablero Roble Oscuro | Tablero | $1.99 |

---

## Estructura de la Base de Datos (MongoDB)

Colecciones principales:
- **users** — Perfil y datos de jugadores
- **rooms** — Salas de juego activas e históricas
- **games** — Estado y movimientos de cada partida
- **skins** — Catálogo de temas disponibles

---

## Autor

**Samuel González**  
Licenciatura en Desarrollo y Gestión de Software  
Universidad Tecnológica de Panamá — 2026
