# Arquitectura de Integración: Stripe, Clerk, Hono, Bun, Zod

## 📋 Estructura del Proyecto

```
tradeup-tcg-main/ (monorepo con Bun)
├── apps/
│   ├── api/              👈 Servidor principal con Hono
│   ├── web/              (cliente Next.js/React)
│   └── backoffice/       (administración)
├── packages/
│   ├── db/               (modelos Mongoose compartidos)
│   ├── shared/           (tipos compartidos)
│   └── ui/               (componentes compartidos)
└── bun.lock              (lock file de dependencias)
```

---

## 🏗️ STACK TECNOLÓGICO

### **BUN** - Runtime de JavaScript/TypeScript
- **Archivo**: `package.json` (root)
- **Rol**: Gestor de monorepo y runtime
- **Uso**:
  ```json
  {
    "scripts": {
      "dev": "bun run --parallel dev --filter=*",
      "build": "bun run --parallel build --filter=*"
    }
  }
  ```
- **Ejecuta** el servidor API con `bun run --watch src/index.ts`

---

## 🍈 HONO - Framework Web Ligero

### **Ubicación Principal**: `apps/api/src/index.ts`

Hono es un framework minimalista que actúa como el **servidor HTTP principal**:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// CORS para comunicación con frontend
app.use('/api/*', cors({
  origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  credentials: true,
}))

// Rutas principales
app.route('/api/auth', authRoutes)
app.route('/api/payments', paymentRoutes)
app.route('/webhooks', webhookRoutes)
```

### **Características usadas de Hono**:
- ✅ **Context (`c`)**: Manejo de requests/responses
- ✅ **Middleware**: `cors()`, `logger()`, `serveStatic()`
- ✅ **Routing**: Modular con `.route()`
- ✅ **Body parsing**: `c.req.parseBody()`, `c.req.json()`

---

## 🔐 CLERK - Autenticación y Gestión de Usuarios

### **Ubicación**: `apps/api/src/lib/clerk.ts`

Clerk proporciona **autenticación sin contraseña** (OAuth, Magic Link, etc.)

```typescript
import { createClerkClient, verifyToken } from '@clerk/backend'

// 1️⃣ Instancia del cliente
export const clerkClient = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY'],
  publishableKey: process.env['CLERK_PUBLISHABLE_KEY'],
})

// 2️⃣ Middleware de autenticación
export async function requireAuth(c: Context, next: Next) {
  const authorization = c.req.header('Authorization')
  const token = authorization?.replace('Bearer ', '')
  
  try {
    const payload = await verifyToken(token, { secretKey })
    c.set('userId', payload.sub)      // ← ID de usuario
    c.set('role', payload.metadata?.role) // ← Rol (buyer/seller/admin)
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}

// 3️⃣ Middlewares derivados
export async function requireSeller(c, next) { /* ... */ }
export async function requireAdmin(c, next) { /* ... */ }
```

### **Flujo de Autenticación**:

```
Frontend (Clerk)
      ↓
   User logs in
      ↓
Frontend recibe token JWT
      ↓
Frontend envía: Authorization: Bearer <token>
      ↓
Backend verifica token con requireAuth
      ↓
c.set('userId', clerkId) → Disponible en toda la ruta
```

### **Uso en Rutas**:

```typescript
// apps/api/src/routes/auth.ts
authRoutes.post('/sync', requireAuth, async (c) => {
  const clerkId = c.get('userId')  // ← Obtenido del middleware
  const clerkUser = await clerkClient.users.getUser(clerkId)
  // Sincronizar usuario de Clerk → MongoDB
})
```

---

## 💰 STRIPE - Pagos y Cobros

### **Ubicación**: `apps/api/src/lib/stripe.ts`

Stripe gestiona **pagos entre usuarios (C2C)** y **compras en tienda (B2C)**

```typescript-
import Stripe from 'stripe'

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'], {
  apiVersion: '2024-04-10',
  typescript: true,
})

// Calcular comisión: TradeUp toma 8% del vendedor
export function calculateCommission(amount: number): number {
  return Math.round(amount * 0.08)
}

// Crear intención de pago con "hold" (captura manual)
export async function createPaymentIntentHold(amount, sellerId) {
  return stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    capture_method: 'manual',  // ← No captura inmediatamente
    transfer_data: {
      destination: sellerId,  // ← Stripe Connect
    },
    application_fee_amount: calculateCommission(amount),
  })
}
```

### **Flujo de Pagos C2C (Comprador → Vendedor)**:

```
apps/api/src/routes/payments.ts → POST /api/payments/c2c-intent

1. Cliente envía: { listingId, amount }
   ↓
2. Backend verifica:
   - Usuario existe y no está baneado
   - Listing existe y está activo
   - No es venta propia
   ↓
3. Backend crea PaymentIntent en Stripe
   - amount: cantidad en centavos
   - capture_method: 'manual' (requiere confirmación)
   - transfer_data: dinero va a cuenta Stripe Connect del vendedor
   - application_fee_amount: comisión de TradeUp (8%)
   ↓
4. Respuesta al cliente: clientSecret (para Stripe.js)
   ↓
5. Cliente confirma pago con Stripe.js
   ↓
6. Stripe dispara webhook → POST /webhooks/stripe
```

### **Flujo de Pagos B2C (Tienda de TradeUp)**:

```
POST /api/payments/store-intent

1. Cliente compra item de la tienda
   ↓
2. Backend crea Transaction (pending)
3. Crea PaymentIntent en Stripe
   - capture_method: 'automatic' ← captura inmediatamente
   - seller: null (TradeUp es el vendedor)
   ↓
4. Cliente paga
   ↓
5. Webhook procesa payment_intent.succeeded
   - Reduce stock del item
   - Completa la Transaction
```

### **Webhooks de Stripe**: `apps/api/src/routes/webhooks.ts`

```typescript
webhookRoutes.post('/stripe', async (c) => {
  const signature = c.req.header('stripe-signature')
  const rawBody = await c.req.text()
  
  // Verificar firma (CRÍTICO para seguridad)
  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Procesar pago completado
      // - Reducir stock
      // - Actualizar Transaction
      break
      
    case 'payment_intent.payment_failed':
      // Marcar como fallido
      break
      
    case 'account.updated':
      // Seller actualizó su Stripe Connect
      break
  }
})
```

---

## ✅ ZOD - Validación de Datos

### **Ubicación**: `apps/api/src/routes/`

Zod valida **datos de entrada** antes de procesarlos

```typescript
// apps/api/src/routes/listings.ts
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const createListingSchema = z.object({
  catalogCardId: z
    .string()
    .min(24, 'catalogCardId must be a valid MongoDB ObjectId'),
  
  condition: z.enum(['mint', 'near_mint', 'excellent', 'good', 'played', 'poor']),
  
  askingPrice: z
    .string()
    .optional()
    .transform((val) => val ? Number(val) : undefined)
    .refine((val) => val === undefined || (Number.isFinite(val) && val >= 0),
      { message: 'askingPrice must be a positive number' }
    ),
})

// Uso en ruta
listingRoutes.post('/', requireAuth, async (c) => {
  const body = await c.req.json()
  const validated = createListingSchema.parse(body)
  // ✅ Ahora validated es type-safe y validado
})
```

### **Características de Zod usadas**:
- ✅ **`.enum()`**: Valores permitidos
- ✅ **`.string().min(24)`**: Restricciones de strings
- ✅ **`.transform()`**: Transformar valores (string → number)
- ✅ **`.refine()`**: Validación personalizada
- ✅ **`.optional()`**: Campo opcional

---

## 🗄️ MONGODB (Mongoose) - Base de Datos

### **Ubicación**: `apps/api/src/lib/db.ts`

```typescript
import mongoose from 'mongoose'

export async function connectDB() {
  await mongoose.connect(process.env['MONGODB_URI'])
}
```

### **Modelos** (en `packages/db/src/`):
- `User`: usuarios sincronizados con Clerk
- `Listing`: tarjetas en venta
- `Transaction`: pagos completados
- `CatalogCard`: base de datos de tarjetas
- `StoreItem`: tienda oficial de TradeUp

---

## 🔄 FLUJO COMPLETO: "Compra una tarjeta"

```
1️⃣ USER LOGIN (Clerk)
   └─ Frontend: Clerk login → obtiene JWT token

2️⃣ SYNC USER
   └─ POST /api/auth/sync
      └─ requireAuth (verifica token con Clerk)
      └─ Sincroniza/crea usuario en MongoDB
      └─ Almacena: clerkId, email, username, role

3️⃣ VER LISTINGS
   └─ GET /api/listings?game=pokemon&condition=mint
      └─ Query en MongoDB, populate de vendedor
      └─ Retorna: lista de listings disponibles

4️⃣ CREAR PAYMENT INTENT
   └─ POST /api/payments/c2c-intent
      └─ requireAuth (verificar usuario existe)
      └─ Validar listing con Zod
      └─ Crear PaymentIntent en Stripe
         ├─ amount, currency, capture_method
         ├─ transfer_data a Stripe Connect del vendedor
         └─ application_fee_amount (comisión)
      └─ Retorna: clientSecret para Stripe.js

5️⃣ PROCESAR PAGO (Cliente-lado)
   └─ Frontend con Stripe.js
      └─ Confirmar PaymentIntent con clientSecret
      └─ Stripe carga tarjeta y cobra

6️⃣ WEBHOOK STRIPE
   └─ Stripe → POST /webhooks/stripe
      └─ Validar firma con webhookSecret
      └─ payment_intent.succeeded
         ├─ Actualizar Transaction a 'completed'
         ├─ Marcar Listing como 'sold'
         └─ Enviar dinero al vendedor (Stripe Connect)

7️⃣ CONFIRMACIÓN AL USUARIO
   └─ Frontend detecta cambio
   └─ Muestra "Compra exitosa"
   └─ Vendedor recibe dinero en su cuenta bancaria
```

---

## 📝 ARCHIVOS CLAVE POR TECNOLOGÍA

| Tecnología | Archivos | Descripción |
|---|---|---|
| **Hono** | `apps/api/src/index.ts`<br>`apps/api/src/routes/*.ts` | Servidor HTTP, rutas |
| **Clerk** | `apps/api/src/lib/clerk.ts` | Auth, middleware, verificación de roles |
| **Stripe** | `apps/api/src/lib/stripe.ts`<br>`apps/api/src/routes/payments.ts`<br>`apps/api/src/routes/webhooks.ts` | Pagos, intenciones, webhooks |
| **Zod** | `apps/api/src/routes/*.ts` | Esquemas de validación |
| **MongoDB** | `packages/db/src/models`<br>`apps/api/src/lib/db.ts` | Conexión, modelos |
| **Bun** | `package.json` (root) | Runtime, monorepo |

---

## 🚀 COMANDO PARA INICIAR

```bash
bun run dev
```

**¿Qué pasa?**
- Bun ejecuta `bun run --parallel dev --filter=*`
- Inicia todas las apps en paralelo
- API: `http://localhost:3001`
- Web: `http://localhost:3000`
- Backoffice: `http://localhost:3002`

---

## 🔑 VARIABLES DE ENTORNO NECESARIAS

```env
# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MongoDB
MONGODB_URI=mongodb+srv://...

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_ORIGIN_BACKOFFICE=http://localhost:3002

# Server
PORT=3001
```

---

## 💡 PUNTOS CLAVE

1. **Hono** = HTTP server minimalista
2. **Clerk** = Autenticación (JWT verificado en middleware)
3. **Stripe** = Pagos con Stripe Connect (para sellers)
4. **Zod** = Validación type-safe
5. **Bun** = Runtime rápido + monorepo manager
6. **MongoDB/Mongoose** = Sincronización de usuarios y datos de transacciones

**Flujo de seguridad**:
```
Token JWT (Clerk) 
    ↓
requireAuth middleware 
    ↓
Verificación de Stripe signature en webhooks
    ↓
Validación con Zod en rutas
    ↓
Almacenamiento seguro en MongoDB
```
