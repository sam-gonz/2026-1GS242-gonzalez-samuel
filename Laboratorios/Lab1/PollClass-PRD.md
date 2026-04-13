# PRD: PollClass — Sistema de Encuestas en Vivo para el Aula

## Resumen del Proyecto

**PollClass** es una aplicación web full stack que permite a un profesor crear encuestas en tiempo real durante la clase, y a los estudiantes votar y ver los resultados. El sistema utiliza polling (HTTP) para actualizar los resultados sin necesidad de WebSockets.

**Stack tecnológico:**
- **Frontend:** React (Vite)
- **Backend:** Bun (usando Bun.serve con router nativo o Hono)
- **Base de datos:** MongoDB (Mongoose)
- **Estilo:** Tailwind CSS
- **Gráficos:** Recharts o Chart.js
- **Runtime:** Bun (en lugar de Node.js, tanto para backend como para instalar dependencias)

**Tiempo estimado de desarrollo agéntico:** 2 horas

---

## Arquitectura

```
┌─────────────┐       HTTP/REST       ┌─────────────┐       Mongoose       ┌─────────────┐
│   Frontend   │ ◄──────────────────► │   Backend    │ ◄─────────────────► │   MongoDB    │
│   (React)    │    JSON / Polling     │   (Bun)      │                     │              │
│   Port 5173  │                       │   Port 3001  │                     │  Port 27017  │
└─────────────┘                       └─────────────┘                       └─────────────┘
```

---

## Modelos de Datos (MongoDB / Mongoose)

### Poll
```javascript
{
  _id: ObjectId,
  title: String,           // "¿Qué framework prefieren?"
  options: [
    {
      text: String,         // "React"
      votes: Number          // 12
    }
  ],
  status: String,           // "active" | "closed"
  code: String,             // Código de 6 caracteres para unirse (ej: "ABC123")
  createdAt: Date,
  closedAt: Date
}
```

### Vote
```javascript
{
  _id: ObjectId,
  pollId: ObjectId,         // Referencia al Poll
  optionIndex: Number,      // Índice de la opción elegida
  voterName: String,        // Nombre del estudiante
  createdAt: Date
}
```

---

## API Endpoints (Bun)

### Polls

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/polls` | Crear nueva encuesta |
| GET | `/api/polls` | Listar todas las encuestas |
| GET | `/api/polls/:id` | Obtener encuesta por ID (incluye conteo de votos) |
| GET | `/api/polls/code/:code` | Obtener encuesta por código (para estudiantes) |
| PATCH | `/api/polls/:id/close` | Cerrar una encuesta |
| DELETE | `/api/polls/:id` | Eliminar una encuesta |

### Votes

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/polls/:id/vote` | Votar en una encuesta (body: `{ optionIndex, voterName }`) |
| GET | `/api/polls/:id/results` | Obtener resultados actualizados (para polling) |

---

## Páginas del Frontend (React)

### 1. Landing Page (`/`)
- Dos botones grandes:
  - **"Soy Profesor"** → navega a `/professor`
  - **"Soy Estudiante"** → navega a `/student`
- Diseño limpio y centrado

### 2. Vista del Profesor (`/professor`)
- **Formulario para crear encuesta:**
  - Campo: Título de la encuesta
  - Campos dinámicos: Opciones (mínimo 2, botón para agregar más)
  - Botón: "Crear Encuesta"
- **Lista de encuestas activas:**
  - Cada encuesta muestra: título, código, número de votos, estado
  - Botón: "Ver Resultados" → navega a `/professor/poll/:id`
  - Botón: "Cerrar Encuesta"
  - Botón: "Eliminar"

### 3. Resultados del Profesor (`/professor/poll/:id`)
- **Título de la encuesta**
- **Código para compartir** (grande, visible, copiable)
- **Gráfico de barras horizontal** mostrando votos por opción en tiempo real
- **Tabla de votos** con nombre del estudiante y opción elegida
- **Total de votos**
- **Botón para cerrar la encuesta**
- **Polling automático:** cada 3 segundos hace GET a `/api/polls/:id/results` y actualiza el gráfico

### 4. Vista del Estudiante (`/student`)
- **Campo para ingresar el código** de la encuesta (6 caracteres)
- **Campo para ingresar su nombre**
- Botón: "Unirme"
- Una vez unido, muestra las opciones para votar
- Después de votar, muestra los resultados actualizados (con polling cada 5 segundos)
- Mensaje de "Ya votaste" si intenta votar de nuevo (validar por nombre + pollId)

---

## Funcionalidades Clave

### Polling (Sin WebSockets)
- En la vista de resultados del profesor: `setInterval` cada **3 segundos** llama a `GET /api/polls/:id/results`
- En la vista post-voto del estudiante: `setInterval` cada **5 segundos**
- Limpiar el intervalo al desmontar el componente (`useEffect` cleanup)

### Generación de Código
- Al crear una encuesta, el backend genera automáticamente un código alfanumérico de 6 caracteres (mayúsculas + números)
- Validar que el código sea único

### Validación de Voto Único
- Validar en el backend que no exista un voto con el mismo `voterName` + `pollId`
- Retornar error 409 si ya votó

---

## Estructura del Proyecto

```
pollclass/
├── client/                    # Frontend React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PollForm.jsx          # Formulario crear encuesta
│   │   │   ├── PollCard.jsx          # Tarjeta de encuesta en lista
│   │   │   ├── PollResults.jsx       # Gráfico + tabla de resultados
│   │   │   ├── VoteForm.jsx          # Opciones para votar
│   │   │   └── JoinPoll.jsx          # Formulario unirse con código
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Professor.jsx
│   │   │   ├── ProfessorPoll.jsx
│   │   │   └── Student.jsx
│   │   ├── services/
│   │   │   └── api.js                # Axios/fetch wrappers
│   │   ├── App.jsx                    # React Router setup
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                    # Backend Bun
│   ├── models/
│   │   ├── Poll.ts
│   │   └── Vote.ts
│   ├── routes/
│   │   ├── polls.ts
│   │   └── votes.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── config/
│   │   └── db.ts                     # Conexión MongoDB
│   ├── index.ts                       # Entry point (Bun.serve o Hono)
│   └── package.json
├── .env
├── .gitignore
├── README.md
└── package.json               # Scripts raíz (concurrently)
```

---

## Variables de Entorno (.env)

```
MONGODB_URI=mongodb://localhost:27017/pollclass
PORT=3001
NODE_ENV=development
```

---

## Scripts de Desarrollo

**Root package.json:**
```json
{
  "scripts": {
    "dev": "concurrently \"bun run server\" \"bun run client\"",
    "server": "cd server && bun run dev",
    "client": "cd client && bun run dev",
    "install-all": "bun install && cd server && bun install && cd ../client && bun install"
  }
}
```

**Server package.json:**
```json
{
  "scripts": {
    "dev": "bun --watch index.ts"
  }
}
```

---

## Diseño Visual (Guía)

- **Paleta de colores:**
  - Primario: Azul (#3B82F6)
  - Secundario: Verde (#10B981) para éxito/votos
  - Fondo: Gris oscuro (#1F2937) o blanco según preferencia
  - Acento: Amarillo (#F59E0B) para códigos
- **Tipografía:** Inter o sistema
- **Layout:** Centrado, máximo 800px de ancho para formularios
- **Código de encuesta:** Mostrar grande (text-4xl), monospace, con botón de copiar
- **Gráficos:** Barras horizontales con colores distintos por opción
- **Responsive:** Mobile-first, funcional en celulares (los estudiantes votarán desde el teléfono)

---

## Orden de Implementación Sugerido

1. **Setup del proyecto** (15 min)
   - Inicializar monorepo con client/ y server/
   - Instalar dependencias
   - Configurar Vite + Tailwind + React Router
   - Configurar Bun + Hono/Bun.serve + Mongoose + conexión a MongoDB

2. **Backend: Modelos y API** (30 min)
   - Crear modelos Poll y Vote
   - Implementar todos los endpoints REST
   - Probar con Thunder Client / curl

3. **Frontend: Vistas del Profesor** (30 min)
   - Landing page
   - Formulario crear encuesta
   - Lista de encuestas
   - Vista de resultados con gráfico y polling

4. **Frontend: Vista del Estudiante** (25 min)
   - Formulario unirse con código
   - Vista de votación
   - Vista post-voto con resultados

5. **Pulido y testing** (20 min)
   - Manejo de errores (encuesta cerrada, ya votó, código inválido)
   - Estilos responsive
   - Prueba end-to-end en clase

---

## Criterios de Aceptación

- [ ] El profesor puede crear una encuesta con título y múltiples opciones
- [ ] Se genera un código único de 6 caracteres por encuesta
- [ ] El estudiante puede unirse ingresando el código y su nombre
- [ ] El estudiante puede votar una sola vez por encuesta
- [ ] Los resultados se actualizan automáticamente (polling cada 3-5 seg)
- [ ] Se muestra un gráfico de barras con los resultados
- [ ] El profesor puede cerrar una encuesta (ya no se aceptan votos)
- [ ] El profesor puede eliminar una encuesta
- [ ] La aplicación es responsive y funciona en móviles
- [ ] El código corre con un solo comando (`bun run dev`)

---

## Notas para el Agente (OpenCode)

- Usar **Bun** como runtime en lugar de Node.js (más rápido, soporte nativo de TypeScript)
- Usar **Hono** como framework HTTP para el backend (ligero, rápido, compatible con Bun) o **Bun.serve** nativo
- El backend debe estar en **TypeScript** (Bun lo soporta nativamente, sin compilación)
- Usar `fetch` nativo en lugar de Axios para reducir dependencias
- Usar `react-router-dom` v6+ para el routing
- Usar `recharts` para los gráficos (más simple que Chart.js con React)
- NO usar WebSockets, solo polling con `setInterval` + `useEffect`
- Manejar CORS manualmente en los headers o con middleware de Hono
- Usar `concurrently` para correr frontend y backend juntos
- Usar `bun --watch` para hot reload del backend (sin nodemon)
- Incluir seeds/datos de prueba en un script opcional
- El código debe estar limpio, comentado y listo para producción
- Todos los comandos de instalación deben usar `bun install` en vez de `npm install`
