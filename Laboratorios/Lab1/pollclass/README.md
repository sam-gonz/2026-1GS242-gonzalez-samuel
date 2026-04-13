# PollClass

Sistema de encuestas en vivo para el aula. Permite a profesores crear encuestas en tiempo real y a estudiantes votar y ver resultados al instante.

## Stack Tecnológico

| Tecnología | Propósito |
|-------------|-----------|
| **React 18** | Frontend framework |
| **Vite** | Build tool y dev server |
| **Tailwind CSS** | Estilos responsivos |
| **Recharts** | Gráficos de resultados |
| **Bun** | Runtime de JavaScript |
| **Hono** | Framework HTTP ligero |
| **MongoDB** | Base de datos |
| **Mongoose** | ODM para MongoDB |

## Requisitos

- **Node.js** 18+ o **Bun**
- **MongoDB** (local o Atlas)
- **npm** o **bun** como package manager

## Instalación Rápida

### 1. Clonar y entrar al directorio

```bash
cd Laboratorios/Lab1/pollclass
```

### 2. Instalar dependencias

```bash
# Con Bun (recomendado)
bun install
bun run install-all

# Con npm
npm install
cd server && npm install && cd ../client && npm install
```

### 3. Asegúrate que MongoDB esté corriendo

```bash
# Local
mongod

# O usa MongoDB Atlas en .env:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pollclass
```

## Ejecución

### Modo desarrollo (ambos servers)

```bash
# Con Bun
bun run dev

# Con npm (necesitas 2 terminales)
# Terminal 1:
cd server && npm run dev
# Terminal 2:
cd client && npm run dev
```

La app estará disponible en:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## Scripts Disponibles

```bash
# Servidor
bun run server       # Backend con hot reload
bun run client       # Frontend con hot reload
bun run dev          # Ambos juntos

# Testing
bun run test         # Probar API con requests
bun run seed         # Poblar con datos de prueba

# Build
cd client && npm run build  # Production build
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Polls
```
POST   /api/polls           Crear encuesta
GET    /api/polls           Listar todas
GET    /api/polls/:id       Obtener por ID
GET    /api/polls/code/:code  Obtener por código
PATCH  /api/polls/:id/close  Cerrar encuesta
DELETE /api/polls/:id       Eliminar encuesta
```

### Votes
```
POST   /api/polls/:id/vote       Votar en encuesta
GET    /api/polls/:id/results    Obtener resultados
```

### Ejemplo de request

```bash
# Crear poll
curl -X POST http://localhost:3001/api/polls \
  -H "Content-Type: application/json" \
  -d '{"title":"¿Python o JavaScript?","options":["Python","JavaScript"]}'

# Votar
curl -X POST http://localhost:3001/api/polls/ID/vote \
  -H "Content-Type: application/json" \
  -d '{"optionIndex":0,"voterName":"Juan"}'

# Ver resultados
curl http://localhost:3001/api/polls/ID/results
```

## Estructura del Proyecto

```
pollclass/
├── server/
│   ├── index.ts           # Entry point con Hono
│   ├── config/
│   │   └── db.ts          # Conexión MongoDB
│   ├── models/
│   │   ├── Poll.ts        # Schema de encuesta
│   │   └── Vote.ts        # Schema de voto
│   ├── routes/
│   │   ├── polls.ts       # CRUD polls
│   │   └── votes.ts       # Votar y resultados
│   ├── test.ts           # Tests de API
│   ├── seed.ts           # Datos de prueba
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── App.jsx        # Router principal
│   │   ├── main.jsx      # Entry point
│   │   ├── index.css     # Estilos globales
│   │   ├── pages/        # Vistas
│   │   │   ├── Landing.jsx
│   │   │   ├── Professor.jsx
│   │   │   ├── ProfessorPoll.jsx
│   │   │   └── Student.jsx
│   │   ├── components/   # Componentes reutilizables
│   │   │   ├── PollForm.jsx
│   │   │   ├── PollCard.jsx
│   │   │   ├── PollResults.jsx
│   │   │   ├── JoinPoll.jsx
│   │   │   └── VoteForm.jsx
│   │   └── services/
│   │       └── api.js    # Cliente API
│   └── package.json
│
├── .env                  # Variables de entorno
├── .gitignore
├── package.json          # Scripts raíz
└── README.md
```

## Guía de Uso

### Para Profesores

1. Abre http://localhost:5173
2. Selecciona **"Soy Profesor"**
3. Crea una encuesta con título y opciones
4. Comparte el **código de 6 caracteres** con tus estudiantes
5. Mira los resultados en tiempo real
6. Cierra la encuesta cuando quieras

### Para Estudiantes

1. Abre http://localhost:5173
2. Selecciona **"Soy Estudiante"**
3. Ingresa el código de la encuesta
4. Escribe tu nombre
5. Selecciona tu opción y vota
6. Ve los resultados actualizados

## Variables de Entorno

```env
MONGODB_URI=mongodb://localhost:27017/pollclass
PORT=3001
NODE_ENV=development
```

## Features

- ✅ Crear encuestas con múltiples opciones
- ✅ Código único de 6 caracteres por encuesta
- ✅ Votación única por estudiante
- ✅ Resultados en tiempo real (polling)
- ✅ Gráficos interactivos con Recharts
- ✅ Diseño responsive (móvil y desktop)
- ✅ Estados de carga y error
- ✅ Polling automático (3s profesor, 5s estudiante)
- ✅ Validación de votos duplicados
- ✅ Cerrar y eliminar encuestas

## Licencia

MIT
