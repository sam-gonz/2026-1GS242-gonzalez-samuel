# PollClass - Documentación Técnica Completa

Sistema de encuestas en vivo para el aula que permite a profesores crear encuestas y a estudiantes votar en tiempo real.

---

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Diagrama de Flujo](#diagrama-de-flujo)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Backend - Archivo por Archivo](#backend---archivo-por-archivo)
5. [Frontend - Archivo por Archivo](#frontend---archivo-por-archivo)
6. [Flujo de Datos](#flujo-de-datos)
7. [Cómo Ejecutar](#cómo-ejecutar)

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                          pollclass                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐                              ┌─────────────────┐  │
│   │   Cliente   │        HTTP/REST             │    Servidor     │  │
│   │   (React)   │◄────────────────────────────►│    (Hono/Bun)   │  │
│   │  Puerto 5173│         JSON                 │   Puerto 3001   │  │
│   └─────────────┘                              └────────┬────────┘  │
│                                                          │           │
│                                                          │ Mongoose  │
│                                                          ▼           │
│                                                 ┌─────────────────┐  │
│                                                 │    MongoDB      │  │
│                                                 │  Puerto 27017   │  │
│                                                 └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Diagrama de Flujo

### Flujo Principal de la Aplicación

```
                                    ┌──────────────┐
                                    │     USUARIO   │
                                    └───────┬───────┘
                                            │
                        ┌───────────────────┼───────────────────┐
                        │                   │                   │
                        ▼                   ▼                   ▼
                 ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                 │   LANDING    │    │   PROFESOR   │    │  ESTUDIANTE  │
                 │    PAGE      │    │    PANEL     │    │    PANEL     │
                 └───────┬──────┘    └───────┬──────┘    └───────┬──────┘
                         │                   │                   │
                         ▼                   ▼                   ▼
              ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
              │  Selecciona Rol  │  │  Crear Encuesta  │  │  Unirse con      │
              │  ─────────────── │  │  ─────────────── │  │  Código          │
              │  • Soy Profesor  │  │  1. Título       │  │  ─────────────── │
              │  • Soy Estudiante│  │  2. Opciones     │  │  1. Ingresa Code │
              └──────────────────┘  │  3. Crear        │  │  2. Ingresa Name │
                                    └────────┬─────────┘  │  3. Unirse        │
                                             │          └────────┬─────────┘
                                             │                   │
                                             ▼                   ▼
                                    ┌──────────────────┐  ┌──────────────────┐
                                    │   VER RESULTADOS │  │     VOTAR         │
                                    │   ────────────   │  │  ────────────     │
                                    │  • Código       │  │  • Seleccionar   │
                                    │  • Gráfico      │  │    opción        │
                                    │  • Tabla votos  │  │  • Confirmar     │
                                    │  • Cerrar poll  │  │  • Ver resultados│
                                    │  (Polling 3s)   │  │  (Polling 5s)   │
                                    └──────────────────┘  └──────────────────┘
```

### Flujo de Creación de Encuesta

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CREAR ENCUESTA                                   │
└─────────────────────────────────────────────────────────────────────┘

   Profesor                        Frontend                        Backend
      │                               │                               │
      │  1. Llena formulario          │                               │
      │  ───────────────────────────►│                               │
      │                               │                               │
      │                               │  2. POST /api/polls           │
      │                               │  {title, options}             │
      │                               │  ───────────────────────────►│
      │                               │                               │
      │                               │                               │  3. Validar datos
      │                               │                               │  • title no vacío
      │                               │                               │  • ≥2 opciones
      │                               │                               │
      │                               │                               │  4. Generar código
      │                               │                               │  único 6 chars
      │                               │                               │
      │                               │                               │  5. Guardar en
      │                               │                               │     MongoDB
      │                               │                               │
      │                               │  6. Response 201              │
      │                               │  {poll, _id, code}           │
      │                               │◄──────────────────────────────│
      │                               │                               │
      │  7. Mostrar código           │                               │
      │  "ABC123"                     │                               │
      │◄──────────────────────────────│                               │
      │                               │                               │
```

### Flujo de Votación

```
┌─────────────────────────────────────────────────────────────────────┐
│                          VOTAR                                      │
└─────────────────────────────────────────────────────────────────────┘

   Estudiante                    Frontend                        Backend
      │                             │                               │
      │  1. Ingresa código          │                               │
      │  "ABC123" + nombre          │                               │
      │  ─────────────────────────►│                               │
      │                             │                               │
      │                             │  2. GET /api/polls/code/ABC123 │
      │                             │  ───────────────────────────►│
      │                             │                               │
      │                             │                               │  3. Buscar poll
      │                             │                               │     por código
      │                             │                               │
      │                             │  4. Response {poll}            │
      │                             │◄──────────────────────────────│
      │                             │                               │
      │  5. Selecciona opción       │                               │
      │  ─────────────────────────►│                               │
      │                             │                               │
      │                             │  6. POST /api/polls/:id/vote  │
      │                             │  {optionIndex, voterName}     │
      │                             │  ───────────────────────────►│
      │                             │                               │
      │                             │                               │  7. Validar:
      │                             │                               │  • Poll existe
      │                             │                               │  • Poll activa
      │                             │                               │  • No votó antes
      │                             │                               │
      │                             │                               │  8. Registrar voto
      │                             │                               │     + Incrementar
      │                             │                               │     contador
      │                             │                               │
      │                             │  9. Response 201              │
      │                             │◄──────────────────────────────│
      │                             │                               │
      │  10. Mostrar resultados     │                               │
      │      (con polling)          │                               │
      │◄────────────────────────────│                               │
```

### Polling (Actualización en Tiempo Real)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         POLLING                                      │
└─────────────────────────────────────────────────────────────────────┘

   ┌─────────┐         ┌─────────┐         ┌─────────┐
   │ VISTA   │         │ FRONTEND│         │ BACKEND │
   │PROFESOR │         │         │         │         │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                   │                   │
        │  1. Cada 3 seg    │                   │
        │◄──────────────────│                   │
        │                   │                   │
        │                   │  GET /results     │
        │                   │──────────────────►│
        │                   │                   │
        │                   │                   │  Buscar poll
        │                   │                   │  + votos
        │                   │  Response JSON    │
        │                   │◄──────────────────│
        │                   │                   │
        │  2. Actualizar    │                   │
        │     gráfico      │                   │
        │◄──────────────────│                   │
        │                   │                   │
        │        (repite cada 3 segundos)        │
        │                   │                   │
```

---

## Estructura del Proyecto

```
pollclass/
│
├── package.json                 # Scripts raíz para ejecutar todo
├── .env                        # Variables de entorno
├── .gitignore
│
├── server/                      # Backend (Bun + Hono + TypeScript)
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── db.ts               # Conexión a MongoDB
│   ├── models/
│   │   ├── Poll.ts             # Schema de encuesta
│   │   └── Vote.ts             # Schema de voto
│   ├── routes/
│   │   ├── polls.ts            # CRUD de encuestas
│   │   └── votes.ts           # Votar y resultados
│   ├── test.ts                # Tests de API
│   ├── seed.ts                # Poblar datos de prueba
│   └── package.json
│
└── client/                     # Frontend (React + Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx            # Entry point
        ├── App.jsx             # Router principal
        ├── index.css           # Estilos globales
        ├── services/
        │   └── api.js          # Cliente HTTP
        ├── pages/
        │   ├── Landing.jsx     # Página inicio
        │   ├── Professor.jsx   # Panel profesor
        │   ├── ProfessorPoll.jsx # Resultados poll
        │   └── Student.jsx     # Panel estudiante
        └── components/
            ├── PollForm.jsx    # Formulario crear
            ├── PollCard.jsx    # Tarjeta encuesta
            ├── PollResults.jsx # Gráfico resultados
            ├── JoinPoll.jsx    # Unirse con código
            └── VoteForm.jsx   # Formulario votar
```

---

## Backend - Archivo por Archivo

### `server/index.ts` (Entry Point)

```typescript
// Importaciones
import { serve } from '@hono/node-server';  // Servidor HTTP
import { Hono } from 'hono';                // Framework web
import { cors } from 'hono/cors';            // CORS para permitir peticiones
import { logger } from 'hono/logger';        // Log de peticiones
import { connectDB } from './config/db';     // Conexión MongoDB
import polls from './routes/polls';          // Rutas de encuestas
import votes from './routes/votes';          // Rutas de votos
```

**¿Qué hace?**
1. Crea una instancia de Hono (app)
2. Configura CORS para permitir peticiones del frontend
3. Registra las rutas `/api/polls/*`
4. Conecta a MongoDB
5. Inicia el servidor en puerto 3001

```typescript
// Middlewares aplicados a TODAS las rutas
app.use('*', logger());         // Log cada request
app.use('*', cors({...}));      // Permisos CORS

// Rutas
app.route('/api/polls', polls);  // /api/polls/*
app.route('/api/polls', votes); // /api/polls/:id/vote, /api/polls/:id/results

// Iniciar servidor
serve({ fetch: app.fetch, port: 3001 });
```

---

### `server/config/db.ts` (Conexión MongoDB)

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pollclass';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
```

**¿Qué hace?**
- Conecta con la base de datos MongoDB
- Usa la variable `MONGODB_URI` del `.env`
- Si falla, termina el proceso

---

### `server/models/Poll.ts` (Schema de Encuesta)

```typescript
// Define la estructura de una encuesta en MongoDB
const PollSchema = new Schema({
  title: { type: String, required: true },        // Título obligatorio
  options: [{                                      // Array de opciones
    text: { type: String, required: true },        // Texto de opción
    votes: { type: Number, default: 0 }            // Contador de votos
  }],
  status: { 
    type: String, 
    enum: ['active', 'closed'],                    // Solo puede ser 'active' o 'closed'
    default: 'active' 
  },
  code: { type: String, required: true, unique: true }, // Código único 6 chars
  createdAt: { type: Date, default: Date.now },    // Fecha de creación
  closedAt: { type: Date }                         // Fecha de cierre (opcional)
});
```

**Ejemplo de documento en MongoDB:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "¿Qué framework prefieres?",
  "options": [
    { "text": "React", "votes": 12 },
    { "text": "Vue", "votes": 8 },
    { "text": "Angular", "votes": 5 }
  ],
  "status": "active",
  "code": "ABC123",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### `server/models/Vote.ts` (Schema de Voto)

```typescript
const VoteSchema = new Schema({
  pollId: { type: ObjectId, ref: 'Poll', required: true },  // Referencia a Poll
  optionIndex: { type: Number, required: true },              // Índice de opción elegida
  voterName: { type: String, required: true },                // Nombre del votante
  createdAt: { type: Date, default: Date.now }
});

// Clave única: no puede haber dos votos del mismo estudiante en la misma poll
VoteSchema.index({ pollId: 1, voterName: 1 }, { unique: true });
```

**Ejemplo de documento:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "pollId": "507f1f77bcf86cd799439011",
  "optionIndex": 0,
  "voterName": "María García",
  "createdAt": "2024-01-15T10:35:00.000Z"
}
```

---

### `server/routes/polls.ts` (Rutas de Encuestas)

Todas las rutas de este archivo tienen prefijo `/api/polls`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear encuesta |
| GET | `/` | Listar todas |
| GET | `/:id` | Por ID |
| GET | `/code/:code` | Por código |
| PATCH | `/:id/close` | Cerrar |
| DELETE | `/:id` | Eliminar |

**Detalle de cada endpoint:**

```typescript
// POST /api/polls - Crear encuesta
polls.post('/', async (c) => {
  // 1. Obtener datos del body
  const { title, options } = await c.req.json();
  
  // 2. Validar
  if (!title?.trim()) return c.json({ error: '...' }, 400);
  if (options.length < 2) return c.json({ error: '...' }, 400);
  
  // 3. Generar código único
  const code = await generateUniqueCode();
  
  // 4. Crear en MongoDB
  const poll = await Poll.create({ title, options, code, status: 'active' });
  
  // 5. Responder
  return c.json(poll, 201);
});
```

```typescript
// PATCH /api/polls/:id/close - Cerrar encuesta
polls.patch('/:id/close', async (c) => {
  // Busca y actualiza el status a 'closed'
  const poll = await Poll.findByIdAndUpdate(
    id,
    { status: 'closed', closedAt: new Date() },
    { new: true }
  );
  return c.json(poll);
});
```

---

### `server/routes/votes.ts` (Rutas de Votos)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/:id/vote` | Registrar voto |
| GET | `/:id/results` | Obtener resultados |

```typescript
// POST /api/polls/:id/vote - Votar
votes.post('/:id/vote', async (c) => {
  const { optionIndex, voterName } = await c.req.json();
  
  // Validaciones
  // 1. ¿La poll existe?
  const poll = await Poll.findById(id);
  if (!poll) return c.json({ error: 'Not found' }, 404);
  
  // 2. ¿Está activa?
  if (poll.status === 'closed') return c.json({ error: 'Closed' }, 400);
  
  // 3. ¿Ya votó?
  const existing = await Vote.findOne({ pollId: id, voterName });
  if (existing) return c.json({ error: 'Already voted' }, 409);
  
  // Registrar voto
  await Vote.create({ pollId: id, optionIndex, voterName });
  
  // Incrementar contador en la poll
  await Poll.updateOne({ _id: id }, { $inc: { [`options.${optionIndex}.votes`]: 1 } });
  
  return c.json({ message: 'Vote recorded' }, 201);
});
```

```typescript
// GET /api/polls/:id/results - Resultados
votes.get('/:id/results', async (c) => {
  // Obtener poll
  const poll = await Poll.findById(id);
  
  // Obtener todos los votos
  const votesList = await Vote.find({ pollId: id }).sort({ createdAt: -1 });
  
  // Calcular total
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  return c.json({ poll, votes: votesList, totalVotes });
});
```

---

### `server/test.ts` (Tests de API)

Script para probar todos los endpoints. Usa `fetch` nativo para hacer requests al servidor.

```bash
bun run test
```

**Flujo de tests:**
1. Health check
2. Crear poll
3. Obtener polls
4. Obtener por ID
5. Obtener por código
6. Votar (primera vez)
7. Intentar votar de nuevo (debe fallar con 409)
8. Votar otro estudiante
9. Ver resultados
10. Cerrar poll
11. Intentar votar en poll cerrada (debe fallar)
12. Eliminar poll

---

### `server/seed.ts` (Datos de Prueba)

Pobla la base de datos con encuestas y votos de ejemplo.

```bash
bun run seed
```

---

## Frontend - Archivo por Archivo

### `client/src/main.jsx` (Entry Point)

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // Router
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**¿Qué hace?**
- Crea el punto de entrada de React
- Envuelve la app en `BrowserRouter` (permite navegación)
- Carga los estilos de Tailwind

---

### `client/src/App.jsx` (Router Principal)

```jsx
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/professor" element={<Professor />} />
      <Route path="/professor/poll/:id" element={<ProfessorPoll />} />
      <Route path="/student" element={<Student />} />
    </Routes>
  );
}
```

**Rutas disponibles:**
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Landing | Página de inicio |
| `/professor` | Professor | Panel del profesor |
| `/professor/poll/:id` | ProfessorPoll | Resultados de una poll |
| `/student` | Student | Panel del estudiante |

---

### `client/src/services/api.js` (Cliente API)

```javascript
const API_BASE = '/api';  // Proxy en vite.config.js redirige a localhost:3001

export const api = {
  // Encuestas
  createPoll: (data) => request('/polls', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  getPolls: () => request('/polls'),
  getPoll: (id) => request(`/polls/${id}`),
  getPollByCode: (code) => request(`/polls/code/${code}`),
  closePoll: (id) => request(`/polls/${id}/close`, { method: 'PATCH' }),
  deletePoll: (id) => request(`/polls/${id}`, { method: 'DELETE' }),
  
  // Votos
  vote: (pollId, data) => request(`/polls/${pollId}/vote`, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  getResults: (pollId) => request(`/polls/${pollId}/results`),
};
```

**Función `request` auxiliar:**
```javascript
async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
}
```

---

### `client/src/pages/Landing.jsx` (Página de Inicio)

```
┌─────────────────────────────────────────┐
│                                          │
│              PollClass                   │
│         Encuestas en vivo                 │
│                                          │
│   ┌─────────────────────────────────┐    │
│   │      Soy Profesor              │    │
│   │      (botón azul)              │    │
│   └─────────────────────────────────┘    │
│                                          │
│   ┌─────────────────────────────────┐    │
│   │      Soy Estudiante             │    │
│   │      (botón verde)              │    │
│   └─────────────────────────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

**Comportamiento:**
- Muestra dos botones grandes
- "Soy Profesor" → Navega a `/professor`
- "Soy Estudiante" → Navega a `/student`

---

### `client/src/pages/Professor.jsx` (Panel del Profesor)

```
┌─────────────────────────────────────────┐
│ PollClass                    [Volver]    │
├─────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐  │
│ │ Crear Nueva Encuesta                │  │
│ │                                     │  │
│ │ Título: [________________]          │  │
│ │                                     │  │
│ │ Opción 1: [________________]       │  │
│ │ Opción 2: [________________]       │  │
│ │ + Agregar opción                    │  │
│ │                                     │  │
│ │ [Crear Encuesta]                    │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ Mis Encuestas                            │
│ [Todas(3)] [Activas(2)] [Cerradas(1)]   │
│                                          │
│ ┌─────────────────────────────────────┐  │
│ │ ¿Qué framework? ABC123 Activa 5v  │  │
│ │ [Ver Resultados] [Cerrar] [Eliminar]│ │
│ └─────────────────────────────────────┘  │
│                                          │
│ ┌─────────────────────────────────────┐  │
│ │ ¿Python o JS?  XYZ789 Cerrada 12v  │  │
│ │ [Ver Resultados] [Eliminar]          │ │
│ └─────────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Formulario para crear encuestas
- Lista de encuestas con filtros (todas/activas/cerradas)
- Botones: Ver Resultados, Cerrar, Eliminar

---

### `client/src/pages/ProfessorPoll.jsx` (Resultados de Encuesta)

```
┌─────────────────────────────────────────┐
│ ← Volver al panel                       │
├─────────────────────────────────────────┤
│                                          │
│ ¿Qué framework prefieren?               │
│                                          │
│ Código: [ABC123] 📋 (copiar)  ● Activa  │
│                                   15 votos│
│                                          │
│ ┌─────────────────────────────────────┐  │
│ │         Gráfico de Barras           │  │
│ │                                     │  │
│ │ React    ████████████████  8       │  │
│ │ Vue      ████████████      5       │  │
│ │ Angular  ████              2       │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ Detalle de Votos                         │
│ ┌─────────────────────────────────────┐  │
│ │ Estudiante       │ Opción          │  │
│ │ María García     │ React           │  │
│ │ Juan Pérez       │ Vue             │  │
│ │ ...              │ ...             │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ [     Cerrar Encuesta     ]              │
│                                          │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Muestra código copiable
- Gráfico en tiempo real (se actualiza cada 3 segundos)
- Tabla con detalle de votos
- Botón para cerrar la encuesta
- Indicador "En vivo" cuando está activa

---

### `client/src/pages/Student.jsx` (Panel del Estudiante)

```
┌─────────────────────────────────────────┐
│ PollClass                    [Volver]    │
├─────────────────────────────────────────┤
│                                          │
│ Paso 1: UNIRSE                          │
│ ┌─────────────────────────────────────┐  │
│ │                                     │  │
│ │ Código:  [  ABC123  ]  (6 chars)   │  │
│ │                                     │  │
│ │ Tu nombre: [Juan Pérez________]     │  │
│ │                                     │  │
│ │ [    Unirme a la Encuesta    ]      │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ ────────── O después de unirse ──────────│
│                                          │
│ Paso 2: VOTAR                            │
│ ┌─────────────────────────────────────┐  │
│ │ ¿Qué framework?                      │  │
│ │                                     │  │
│ │ ( ) React                           │  │
│ │ ( ) Vue                             │  │
│ │ ( ) Angular                          │  │
│ │                                     │  │
│ │ [    Confirmar Voto    ]             │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ ────────── Después de votar ──────────── ││
│                                          │
│ Paso 3: RESULTADOS                       │
│ (Igual que ProfessorPoll pero sin        │
│  opción de cerrar)                       │
│                                          │
└─────────────────────────────────────────┘
```

**Estados:**
1. `step = 'join'` → Formulario para unirse
2. `step = 'vote'` → Opciones para votar
3. `step = 'results'` → Ver resultados (con polling cada 5s)

---

### `client/src/components/PollForm.jsx`

Formulario para crear encuestas.

```jsx
// Estados
const [title, setTitle] = useState('');           // Título
const [options, setOptions] = useState(['', '']);  // Opciones (empieza con 2)
const [loading, setLoading] = useState(false);     // Loading
const [error, setError] = useState('');            // Error
const [success, setSuccess] = useState(false);     // Éxito

// Funciones
addOption()      // Agrega una nueva opción al array
removeOption(i)  // Elimina opción en índice i
updateOption(i,v) // Actualiza opción en índice i con valor v
handleSubmit()    // Envía al API
```

---

### `client/src/components/PollCard.jsx`

Tarjeta que muestra una encuesta en la lista.

```jsx
// Props
poll           // Objeto poll completo
onClose        // Función para cerrar
onDelete       // Función para eliminar
showResults    // Si true, muestra botón "Ver Resultados"
```

---

### `client/src/components/PollResults.jsx`

Muestra gráfico y tabla de resultados.

```jsx
// Usa Recharts para el gráfico de barras
<BarChart data={chartData} layout="vertical">
  <Bar dataKey="votes">
    <Cell fill={COLORS[index]} />  // Colores diferentes por barra
  </Bar>
</BarChart>

// Barras de progreso individuales
<div style={{ width: `${percentage}%` }} />

// Tabla con detalles de votos
<table>
  <tr>
    <td>Juan Pérez</td>
    <td>React</td>
  </tr>
</table>
```

---

### `client/src/components/JoinPoll.jsx`

Formulario para que el estudiante se una a una poll.

```jsx
// Validaciones
- Código debe tener exactamente 6 caracteres
- Nombre no puede estar vacío
- Código se convierte a mayúsculas automáticamente
```

---

### `client/src/components/VoteForm.jsx`

Formulario de votación con opciones seleccionables.

```jsx
// Estados
selectedOption  // Índice de opción seleccionada (null inicialmente)

// UI
- Radio buttons estilizados
- Animación al seleccionar
- Botón deshabilitado si no hay selección
```

---

## Flujo de Datos

### Crear Encuesta

```
UI → PollForm → api.createPoll() → POST /api/polls
                                          │
                                          ▼
                                    polls.post('/')
                                          │
                                          ▼
                                    Validaciones
                                          │
                                          ▼
                                    generateUniqueCode()
                                          │
                                          ▼
                                    Poll.create()
                                          │
                                          ▼
                                    { poll, _id, code }
                                          │
                                          ▼
Professor.jsx ← api.getPolls() ← GET /api/polls
```

### Votar

```
UI → VoteForm → api.vote(id, {optionIndex, voterName})
                                    │
                                    ▼
                              POST /api/polls/:id/vote
                                    │
                                    ▼
                              Validaciones:
                              • ¿Poll existe?
                              • ¿Activa?
                              • ¿Ya votó?
                                    │
                                    ▼
                              Vote.create()
                              Poll.updateOne($inc)
                                    │
                                    ▼
                              { message: 'Vote recorded' }
                                    │
                                    ▼
UI → api.getResults() → GET /api/polls/:id/results
                  │
                  ▼
            Actualizar gráfico
            (setInterval 5s)
```

---

## Cómo Ejecutar

### 1. Asegúrate que MongoDB esté corriendo

```bash
# Local
mongod

# O usa la URI de MongoDB Atlas en .env
```

### 2. Instalar dependencias

```bash
cd Laboratorios/Lab1/pollclass
npm install
cd server && npm install && cd ../client && npm install
```

### 3. Ejecutar

```bash
# Opción A: Todo junto
npm run dev

# Opción B: Servidores separados
# Terminal 1:
cd server && npm run dev    # Puerto 3001
# Terminal 2:
cd client && npm run dev    # Puerto 5173
```

### 4. Abrir navegador

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/health

### 5. Probar API

```bash
cd server
npm run test    # Tests automáticos
npm run seed    # Poblar con datos de ejemplo
```

---

## Glosario

| Término | Descripción |
|---------|-------------|
| **Poll** | Encuesta o votación |
| **Polling** | Técnica de actualizar datos consultando el servidor periódicamente |
| **Mongoose** | ODM (Object Data Modeling) para MongoDB |
| **Hono** | Framework HTTP ligero y rápido |
| **Proxy** | Configuración de Vite para redirigir peticiones al backend |
| **Schema** | Estructura que define la forma de los documentos en MongoDB |
| **ObjectId** | Identificador único de MongoDB |
| **CORS** | Cross-Origin Resource Sharing - permite peticiones desde otros orígenes |

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` en proxy | Asegúrate que el backend esté corriendo en puerto 3001 |
| `MongoDB connection error` | Verifica que MongoDB esté corriendo |
| "Código inválido" | Verifica que el código sea de 6 caracteres exactos |
| "Ya votaste" | El nombre ya fue usado para votar en esa poll |
| "Poll cerrada" | La poll fue cerrada por el profesor |

---

## Créditos

Desarrollado para el curso de Desarrollo de Software 9 - UTP
