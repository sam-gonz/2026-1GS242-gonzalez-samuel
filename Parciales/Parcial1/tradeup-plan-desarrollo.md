# Trade Up — Plan de Desarrollo

## Resumen Ejecutivo

Trade Up es una plataforma de marketplace para el trading de cartas de colección (Pokémon, Yu-Gi-Oh!, One Piece, Dragon Ball Z, Magic: The Gathering, entre otras). Los usuarios pueden publicar cartas en venta, intercambiar cartas con otros coleccionistas, dejar reseñas en perfiles de vendedores y realizar pagos de forma segura. La plataforma contempla dos aplicaciones independientes: una orientada al cliente final y un panel de administración (back office).

El proyecto cubre los siguientes modelos de comercio electrónico:

| Modelo | Aplicación en Trade Up |
|--------|------------------------|
| **C2C** | Usuarios que venden e intercambian cartas entre sí (modelo principal) |
| **B2C** | La plataforma vende packs sellados y accesorios oficiales |
| **B2B** | Tiendas de cartas (LGS) que venden inventario a granel a otras tiendas |
| **B2G** | Distribuidores certificados con licencia que operan en la plataforma |
| **G2B** | Organismos reguladores que validan y compran a distribuidores registrados |
| **G2G** | Verificación y cumplimiento entre distribuidores oficiales |

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend (Customer App) | React + Vite (TypeScript) |
| Frontend (Back Office) | React + Vite (TypeScript) |
| Backend | Hono sobre Bun (TypeScript) |
| Base de datos | MongoDB con Mongoose |
| Autenticación | Clerk — SDK `@clerk/react` + `@clerk/backend` |
| Pagos | Stripe — `stripe` Node SDK + `@stripe/react-stripe-js` |
| Estilos | Tailwind CSS v4 |
| Data Fetching | TanStack Query (React Query) |
| Validación | Zod |

---

## Modelos de Base de Datos

### User
Sincronizado con Clerk mediante webhook. Campos: `clerkId`, `username`, `email`, `avatar`, `bio`, `role` (enum: `user` | `business` | `admin`), `rating` (promedio), `reviewCount`, `createdAt`, `isVerified`, `isSuspended`.

### Card (Listing de venta)
Representa una carta publicada por un usuario. Campos: `sellerId`, `title`, `game` (enum: `pokemon` | `yugioh` | `onepiece` | `dragonball` | `magic` | `other`), `set`, `cardNumber`, `condition` (enum: `mint` | `near-mint` | `excellent` | `good` | `played` | `poor`), `price`, `currency`, `images[]`, `description`, `status` (enum: `available` | `sold` | `reserved` | `deleted`), `views`, `createdAt`, `updatedAt`.

### TradePost (Post de intercambio)
Publicación donde un usuario indica qué cartas tiene disponibles y cuáles busca. Campos: `userId`, `title`, `description`, `haves[]` (con `cardName`, `game`, `condition`, `images[]`, `quantity`), `wants[]` (con `cardName`, `game`, `condition`, `notes`), `status` (enum: `open` | `closed` | `completed`), `offerCount`, `createdAt`.

### TradeOffer (Oferta de intercambio)
Oferta realizada sobre un TradePost. Campos: `tradePostId`, `offererId`, `offeringCards[]`, `message`, `status` (enum: `pending` | `accepted` | `rejected` | `cancelled`), `createdAt`.

### Order (Compra con Stripe)
Registro de una transacción completada. Campos: `buyerId`, `sellerId`, `cardId`, `stripePaymentIntentId`, `stripeSessionId`, `amount`, `currency`, `status` (enum: `pending` | `paid` | `shipped` | `delivered` | `refunded` | `cancelled`), `shippingAddress` (street, city, country, zip), `createdAt`.

### Review (Reseña de usuario)
Solo se puede dejar una reseña tras una orden completada. Campos: `reviewerId`, `reviewedUserId`, `orderId`, `rating` (1–5), `comment`, `createdAt`.

### Notification
Campos: `userId`, `type`, `message`, `isRead`, `metadata`, `createdAt`.

### Category
Administrado exclusivamente desde el back office. Campos: `name`, `game`, `imageUrl`, `isActive`, `createdAt`.

---

## API — Rutas Hono

Prefijo base: `/api/v1`

### Auth y Usuarios

```
POST   /webhooks/clerk            ← Sincronizar usuario desde Clerk
GET    /users/:username           ← Perfil público
GET    /users/:id/reviews
POST   /users/:id/reviews         ← [auth] Dejar reseña (solo tras orden completada)
PATCH  /users/me                  ← [auth] Editar mi perfil
```

### Cards (Listings)

```
GET    /cards                     ← Listado con filtros: game, condition, priceMin, priceMax, search, sort
GET    /cards/:id
POST   /cards                     ← [auth: user | business] Crear listing
PATCH  /cards/:id                 ← [auth: owner]
DELETE /cards/:id                 ← [auth: owner | admin]
GET    /cards/me                  ← [auth] Mis listings
```

### Trades

```
GET    /trades                    ← Feed de posts con filtros
GET    /trades/:id
POST   /trades                    ← [auth] Crear trade post
PATCH  /trades/:id                ← [auth: owner]
DELETE /trades/:id                ← [auth: owner | admin]
POST   /trades/:id/offers         ← [auth] Hacer oferta
GET    /trades/:id/offers         ← [auth: owner] Ver ofertas recibidas
PATCH  /trades/:id/offers/:offerId ← [auth: owner] Aceptar o rechazar oferta
```

### Orders y Pagos (Stripe)

```
POST   /orders/checkout-session   ← [auth] Crear Stripe Checkout Session
GET    /orders                    ← [auth] Mis órdenes (compras y ventas)
GET    /orders/:id
PATCH  /orders/:id/ship           ← [auth: seller] Marcar como enviado
POST   /webhooks/stripe           ← Webhook de Stripe (pagos, reembolsos)
```

### Notificaciones

```
GET    /notifications             ← [auth]
PATCH  /notifications/read-all    ← [auth]
```

### Admin (solo role: admin)

```
GET    /admin/stats
GET    /admin/users
PATCH  /admin/users/:id/suspend
PATCH  /admin/users/:id/verify
GET    /admin/cards
DELETE /admin/cards/:id
GET    /admin/orders
GET    /admin/reviews
DELETE /admin/reviews/:id
GET    /admin/categories
POST   /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id
```

---

## Middleware del Backend

1. **`clerkAuth`** — Valida el JWT de Clerk en cada request protegido. Extrae `userId` y `role` desde `publicMetadata`.
2. **`requireRole(roles[])`** — Autorización basada en rol. Rechaza con 403 si el rol no está permitido.
3. **`rateLimiter`** — Límite básico de peticiones por IP para prevenir abuso.
4. **`errorHandler`** — Respuestas de error estandarizadas en formato JSON: `{ success: false, error: "mensaje" }`.
5. **`cors`** — Configurado para permitir los orígenes de las apps web y el back office.

---

## Autenticación con Clerk

- Instalar `@clerk/react` en ambas apps frontend y `@clerk/backend` en la API.
- El rol del usuario se guarda en `publicMetadata.role` de Clerk. El valor por defecto al registrarse es `user`.
- Usar `ClerkProvider` con los métodos de routing correspondientes en React.
- Componentes a utilizar: `<SignIn />`, `<SignUp />`, `<UserButton />`, `useUser()`, `useAuth()`.
- El webhook en `POST /api/v1/webhooks/clerk` sincroniza los datos del usuario a MongoDB cada vez que se crea o actualiza desde Clerk.
- Proteger rutas del frontend con `<SignedIn>`, `<SignedOut>` y `<RedirectToSignIn>`.
- Agregar una función seed que promueva al primer usuario registrado al rol `admin`.

---

## Pagos con Stripe

El flujo de pago sigue estos pasos:

1. El usuario hace clic en **"Comprar"** en el listing de una carta.
2. El frontend llama a `POST /api/v1/orders/checkout-session` con `cardId` y `shippingAddress`.
3. La API crea una `Stripe Checkout Session` incluyendo en `payment_intent_data.metadata` los campos `cardId`, `buyerId` y `sellerId`.
4. El frontend redirige al usuario a `session.url` (página alojada por Stripe).
5. Stripe llama al webhook `POST /api/v1/webhooks/stripe` con los siguientes eventos:
   - `payment_intent.succeeded` → actualizar Order a `paid`, marcar Card como `sold`, enviar notificaciones al comprador y vendedor.
   - `charge.refunded` → actualizar Order a `refunded`.
6. Al completar el pago, el usuario es redirigido a `/orders/:id/confirmation`.

**Reglas de seguridad:**
- Verificar el header `Stripe-Signature` en el webhook para garantizar autenticidad.
- El precio de la carta **siempre** se obtiene desde la base de datos en el servidor, nunca desde el cliente.
- Stripe opera en **modo test** durante el desarrollo. Utilizar las tarjetas de prueba de la documentación oficial de Stripe.

---

## Customer Facing App — Páginas

### Páginas Públicas

| Ruta | Nombre | Descripción |
|------|--------|-------------|
| `/` | Home / Landing | Hero, cartas destacadas, categorías por juego, últimos trade posts, top vendedores |
| `/marketplace` | Marketplace | Grid de listings con filtros sidebar (juego, condición, precio, set), búsqueda y paginación |
| `/marketplace/:id` | Detalle de Carta | Galería de imágenes, info de la carta, perfil del vendedor con rating, botón "Comprar", cartas similares |
| `/trades` | Trade Board | Feed de posts de intercambio, filtros por juego y búsqueda |
| `/trades/:id` | Detalle de Trade | Cartas ofrecidas y buscadas por el poster, formulario para hacer oferta, lista de ofertas si eres el owner |
| `/users/:username` | Perfil Público | Avatar, bio, rating, reseñas, listings activos, trade posts activos |
| `/search` | Búsqueda | Resultados combinados de cartas y trades |

### Páginas Autenticadas

| Ruta | Nombre | Descripción |
|------|--------|-------------|
| `/dashboard` | Mi Dashboard | Resumen: listings activos, órdenes pendientes, notificaciones recientes, rating |
| `/dashboard/listings` | Mis Listings | CRUD de cartas en venta, cambiar estado de un listing |
| `/dashboard/listings/new` | Publicar Carta | Formulario: juego, set, condición, precio, fotos |
| `/dashboard/trades` | Mis Trades | Mis posts de intercambio, gestión de ofertas recibidas |
| `/dashboard/orders` | Mis Órdenes | Historial de compras y ventas con estados, marcar enviado si eres vendedor |
| `/dashboard/notifications` | Notificaciones | Lista de notificaciones con opción de marcar todas como leídas |
| `/dashboard/profile` | Editar Perfil | Bio, username, avatar (sincronizado con Clerk) |
| `/orders/:id/confirmation` | Confirmación de Pago | Resumen de la orden completada tras el redirect de Stripe |

---

## Back Office — Páginas (Solo Admins)

Accesible únicamente con `role: admin`. Cada ruta debe tener un guard que verifique el rol antes de renderizar.

| Ruta | Nombre | Descripción |
|------|--------|-------------|
| `/` | Dashboard | KPIs: usuarios totales, ventas del mes, listings activos, trades abiertos. Gráficas con Recharts. |
| `/users` | Gestión de Usuarios | Tabla paginada, filtros, opciones para suspender o verificar usuario, ver perfil. |
| `/listings` | Gestión de Listings | Tabla con filtros por juego y estado, opción de eliminar, ver detalle. |
| `/orders` | Gestión de Órdenes | Historial completo de transacciones, filtros por estado y montos. |
| `/reviews` | Gestión de Reseñas | Ver y eliminar reseñas inapropiadas. |
| `/categories` | Categorías / Sets | CRUD de categorías y sets de cartas organizados por juego. |
| `/settings` | Configuración | Datos generales de la plataforma: comisión (%), información de contacto. |

---

## Componentes Clave

### Compartidos (ambas apps)
- `<Navbar>` — Logo "Trade Up", links de navegación, buscador, campana de notificaciones, `<UserButton />` de Clerk.
- `<CardListingCard>` — Tarjeta de listing con imagen, badge del juego, condición, precio y rating del vendedor.
- `<CardGrid>` — Grid responsivo de `<CardListingCard>`.
- `<UserAvatar>` — Avatar con estrellas de rating.
- `<StarRating>` — Componente de visualización y edición de rating.
- `<FilterSidebar>` — Filtros con checkboxes por juego, condición y rango de precio.
- `<Pagination>` — Paginación server-side.
- `<EmptyState>` — Siempre con mensaje descriptivo e ícono. Nunca dejar una sección en blanco.
- `<LoadingSkeletons>` — Skeletons que imitan la estructura real del layout.
- `<Toast>` — Notificaciones de éxito y error.
- `<Modal>` — Base para confirmaciones y formularios emergentes.
- `<Badge>` — Para identificar el juego (Pokémon → amarillo, Yu-Gi-Oh! → morado, One Piece → rojo, Dragon Ball Z → naranja, Magic → verde oscuro) y la condición de la carta.

### Customer App (exclusivos)
- `<TradePostCard>` — Tarjeta de un post de intercambio con preview de cartas ofrecidas y buscadas.
- `<MakeOfferModal>` — Formulario para proponer cartas en respuesta a un trade post.
- `<OffersList>` — Lista de ofertas recibidas visible solo para el owner del trade post.
- `<ReviewForm>` — Formulario de reseña disponible únicamente tras una orden completada.
- `<ReviewList>` — Lista de reseñas en el perfil de un usuario.

---

## Orden de Implementación

Seguir este orden durante el desarrollo:

1. **Setup inicial** — configurar workspaces Bun, variables de entorno y archivo `.env.example`.
2. **API base** — conexión a MongoDB, schemas Mongoose, middleware (Clerk, CORS, error handler).
3. **Clerk webhook** — sincronizar usuarios nuevos y actualizados a MongoDB.
4. **CRUD de Cards** — rutas completas con validación Zod.
5. **Stripe** — Checkout Session, webhook handler, modelo Order.
6. **Trades** — rutas de TradePost y TradeOffer.
7. **Reviews y Ratings** — calcular promedio de rating al crear una reseña.
8. **Rutas Admin** — stats, gestión de usuarios, listings y órdenes.
9. **Frontend Customer App** — instalar Clerk, TanStack Query y Tailwind. Implementar páginas en el orden listado en la sección correspondiente.
10. **Frontend Back Office** — panel de administración con guard de rol en cada ruta.
11. **Notificaciones** — generar notificaciones en eventos clave: oferta recibida, orden pagada, reseña recibida.
12. **QA y polish** — empty states, skeletons, manejo de errores, responsividad mobile-first.

---

## Variables de Entorno

### `apps/api/.env`

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/tradeup
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=5
FRONTEND_URL=http://localhost:5173
BACKOFFICE_URL=http://localhost:5174
```

### `apps/web/.env`

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### `apps/backoffice/.env`

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Notas y Consideraciones Finales

- Todos los endpoints protegidos deben verificar el JWT de Clerk. El precio de las cartas y los roles **siempre** se leen desde el servidor, nunca del cliente.
- Usar **Zod** para validar todos los inputs en la API antes de interactuar con la base de datos.
- Todos los errores deben retornar JSON con el formato `{ success: false, error: "mensaje" }` y el HTTP status code correcto.
- Implementar **paginación** (offset o cursor-based) en todos los listados desde el inicio del desarrollo.
- Las imágenes de cartas pueden manejarse con **Cloudinary** o simplemente aceptando URLs públicas en el MVP; definir la estrategia en el archivo `.env`.
- Los **colores de badge por juego** sugeridos: Pokémon → amarillo, Yu-Gi-Oh! → morado, One Piece → rojo, Dragon Ball Z → naranja, Magic → verde oscuro, Other → gris.
- El frontend debe ser **completamente responsivo** (mobile-first). Trade Board y Marketplace deben funcionar correctamente en 375px.
- Stripe opera en **modo test** durante el desarrollo. Utilizar las tarjetas de prueba oficiales de Stripe.
- La asignación del rol `admin` se realiza manualmente desde el dashboard de Clerk en `publicMetadata`. Incluir una función seed que promueva al primer usuario a admin automáticamente.
