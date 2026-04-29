# 🗄️ ESTRUCTURA DE LA BASE DE DATOS - TradeUp TCG

## 📊 BASE DE DATOS: MongoDB con Mongoose

**Ubicación**: `packages/db/src/models/`

La base de datos está diseñada para una plataforma de **intercambio de tarjetas de juegos de cartas coleccionables** (TCG) como Pokémon, Yu-Gi-Oh, etc.

---

## 👥 **USER** - Usuarios del Sistema

```typescript
interface IUser {
  clerkId: string              // ID único de Clerk (autenticación)
  username: string             // Nombre de usuario único
  email: string                // Email único
  role: 'buyer' | 'seller' | 'admin'  // Rol del usuario
  stripeConnectAccountId?: string    // ID de cuenta Stripe Connect
  stripeConnectStatus: 'none' | 'pending' | 'active'  // Estado Stripe
  reputation: number           // Puntuación de reputación (0-100)
  reviewCount: number          // Número de reseñas recibidas
  isBanned: boolean            // Usuario baneado?
  createdAt: Date
  updatedAt: Date
}
```

**Índices**: `clerkId` (único), `username` (único), `email` (único)

**Relaciones**:
- Un usuario puede tener múltiples `Listing` (como vendedor)
- Un usuario puede tener múltiples `Offer` (como comprador)
- Un usuario puede tener múltiples `Transaction` (como comprador/vendedor)
- Un usuario puede tener múltiples `Review` (como reviewer/reviewee)

---

## 🃏 **CATALOGCARD** - Catálogo de Tarjetas

```typescript
interface ICatalogCard {
  game: 'pokemon' | 'yugioh' | 'onepiece' | 'dragonball' | 'mtg' | 'other'
  name: string                // Nombre de la carta
  set: string                 // Nombre del set (ej: "Base Set")
  setCode: string             // Código del set (ej: "BS")
  cardNumber: string          // Número de carta (ej: "1/102")
  rarity: 'common' | 'uncommon' | 'rare' | 'super_rare' | 'ultra_rare' | 'secret_rare' | 'promo' | 'other'
  imageUrl?: string           // URL de imagen de la carta
  language: string            // Idioma (default: 'en')
  createdAt: Date
  updatedAt: Date
}
```

**Índices**: `game`, `name`, búsqueda de texto en `name` y `set`

**Relaciones**:
- Una carta puede estar en múltiples `Listing`
- Una carta puede estar en múltiples `StoreItem`
- Una carta puede ser referenciada en `wantsCards` de `Listing`

---

## 📦 **LISTING** - Anuncios de Venta/Intercambio

```typescript
interface IListing {
  seller: ObjectId             // ref: User
  catalogCard: ObjectId        // ref: CatalogCard
  condition: 'mint' | 'near_mint' | 'excellent' | 'good' | 'played' | 'poor'
  photos: string[]             // Rutas relativas: /uploads/uuid.jpg
  askingPrice?: number         // Precio en centavos (undefined = solo intercambio)
  wantsCards: ObjectId[]       // refs: CatalogCard que quiere el vendedor
  status: 'active' | 'sold' | 'traded' | 'cancelled' | 'expired'
  views: number                // Contador de vistas
  createdAt: Date
  updatedAt: Date
}
```

**Índices**: `seller`, `status`

**Relaciones**:
- Pertenece a un `User` (seller)
- Referencia una `CatalogCard`
- Puede tener múltiples `Offer`
- Puede generar una `Transaction` cuando se vende

---

## 🤝 **OFFER** - Ofertas en Anuncios

```typescript
interface IOffer {
  listing: ObjectId            // ref: Listing (anuncio objetivo)
  buyer: ObjectId              // ref: User
  seller: ObjectId             // ref: User
  type: 'money' | 'cards' | 'mixed'
  moneyAmount?: number         // Cantidad en centavos
  offeredCards: ObjectId[]     // refs: Listing que ofrece el comprador
  stripePaymentIntentId?: string  // ID de Stripe (si hay dinero)
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired'
  expiresAt: Date              // Expira en 72 horas
  createdAt: Date
  updatedAt: Date
}
```

**Índices**: `listing`, `expiresAt + status` (para expiración automática)

**Relaciones**:
- Referencia un `Listing`
- Referencia `User` (buyer y seller)
- Puede generar una `Transaction` si se acepta

---

## 💸 **TRANSACTION** - Transacciones Completadas

```typescript
interface ITransaction {
  offer?: ObjectId             // ref: Offer (opcional)
  buyer: ObjectId              // ref: User
  seller?: ObjectId            // ref: User (null para B2C)
  isBuyerPurchase: boolean     // true = compra en tienda (B2C)
  type: 'c2c_money' | 'c2c_trade' | 'c2c_mixed' | 'b2c'
  grossAmount?: number         // Monto bruto en centavos
  commissionAmount?: number    // Comisión de TradeUp (8%)
  netAmount?: number           // Monto neto para vendedor
  stripePaymentIntentId?: string  // ID de intención de pago Stripe
  stripeTransferId?: string    // ID de transferencia Stripe
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  shippingStatus: 'pending' | 'preparing' | 'shipped' | 'delivered'
  reviewEligible: boolean      // Puede ser reseñada?
  storeItemSnapshot?: {        // Snapshot del item en tienda (para B2C)
    name?: string
    imageUrl?: string
    condition?: string
    set?: string
    storeItemId?: string
  }
  createdAt: Date
  updatedAt: Date
}
```

**Relaciones**:
- Puede provenir de un `Offer`
- Siempre tiene un `buyer` (User)
- Puede tener un `seller` (User) o ser null (B2C)
- Puede generar una `Review`

---

## 🏪 **STOREITEM** - Items en Tienda Oficial

```typescript
interface IStoreItem {
  catalogCard: ObjectId        // ref: CatalogCard
  condition: string            // Descripción de condición
  photos: string[]             // Rutas de fotos
  price: number                // Precio en centavos
  stock: number                // Cantidad disponible
  isGraded: boolean            // Está calificada por tercero?
  gradeValue?: number          // Valor de calificación (ej: PSA 10)
  gradeCompany?: string        // Compañía calificadora
  isSealed: boolean            // Está sellada?
  isActive: boolean            // Disponible para venta?
  createdAt: Date
  updatedAt: Date
}
```

**Relaciones**:
- Referencia una `CatalogCard`
- Puede generar `Transaction` cuando se vende

---

## ⭐ **REVIEW** - Reseñas de Usuarios

```typescript
interface IReview {
  transaction: ObjectId        // ref: Transaction
  reviewer: ObjectId           // ref: User (quien reseña)
  reviewee: ObjectId           // ref: User (quien recibe reseña)
  rating: 1 | 2 | 3 | 4 | 5    // Calificación 1-5 estrellas
  comment?: string             // Comentario opcional (máx 500 chars)
  createdAt: Date
}
```

**Índices**: `reviewee`, `transaction + reviewer` (único)

**Relaciones**:
- Proviene de una `Transaction`
- Actualiza `reputation` y `reviewCount` del `reviewee`

---

## 📝 **CATALOGREQUEST** - Solicitudes de Nuevas Cartas

```typescript
interface ICatalogRequest {
  requestedBy: ObjectId        // ref: User
  game: string
  name: string
  set: string
  cardNumber: string
  rarity: string
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}
```

**Relaciones**:
- Solicitada por un `User`
- Puede crear una nueva `CatalogCard` si se aprueba

---

## 🔗 **RELACIONES PRINCIPALES**

```
User
├── 1:N → Listing (como seller)
├── 1:N → Offer (como buyer)
├── 1:N → Transaction (como buyer/seller)
├── 1:N → Review (como reviewer/reviewee)
└── 1:N → CatalogRequest (como requester)

CatalogCard
├── 1:N → Listing
├── 1:N → StoreItem
└── 1:N → wantsCards (en Listing)

Listing
├── N:1 → User (seller)
├── N:1 → CatalogCard
├── 1:N → Offer
└── 1:1 → Transaction (cuando se vende)

Offer
├── N:1 → Listing
├── N:1 → User (buyer)
├── N:1 → User (seller)
└── 1:1 → Transaction (si se acepta)

Transaction
├── N:1 → Offer (opcional)
├── N:1 → User (buyer)
├── N:1 → User (seller, opcional)
└── 1:1 → Review (opcional)

StoreItem
├── N:1 → CatalogCard
└── 1:1 → Transaction (cuando se vende)

Review
├── N:1 → Transaction
├── N:1 → User (reviewer)
└── N:1 → User (reviewee)

CatalogRequest
└── N:1 → User (requestedBy)
```

---

## 💡 **LÓGICA DE NEGOCIO**

### **Flujo de Venta C2C (Usuario a Usuario)**:
1. `User` crea `Listing` con `CatalogCard`
2. Otro `User` hace `Offer` en el `Listing`
3. Si se acepta, se crea `Transaction`
4. Se procesa pago con Stripe
5. Se puede dejar `Review`

### **Flujo de Tienda B2C**:
1. Admin crea `StoreItem` con `CatalogCard`
2. `User` compra directamente
3. Se crea `Transaction` con `seller = null`
4. Se procesa pago con Stripe
5. Se reduce `stock` del `StoreItem`

### **Sistema de Reputación**:
- Las `Review` actualizan `reputation` y `reviewCount` del `reviewee`
- Solo transacciones completadas pueden ser reseñadas

### **Stripe Connect**:
- `User` con `role = 'seller'` puede conectar cuenta Stripe
- `stripeConnectStatus` indica si puede recibir pagos
- Pagos van directamente a cuenta del vendedor menos comisión

---

## 🔍 **CONSULTAS FRECUENTES**

### **Buscar listings activos**:
```javascript
Listing.find({ status: 'active' })
  .populate('catalogCard')
  .populate('seller', 'username reputation')
```

### **Transacciones de un usuario**:
```javascript
Transaction.find({
  $or: [{ buyer: userId }, { seller: userId }]
}).populate('buyer seller')
```

### **Calcular reputación promedio**:
```javascript
const reviews = await Review.find({ reviewee: userId })
const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
```

---

## 📈 **ESCALABILIDAD**

- **Índices** en campos frecuentemente consultados
- **Populate** para joins eficientes
- **Snapshots** (como `storeItemSnapshot`) para evitar cambios históricos
- **Enums** para mantener integridad de datos
- **Timestamps** automáticos con Mongoose</content>
<parameter name="filePath">c:\UTP\DS9\2026-1GS242-gonzalez-samuel\Parciales\Parcial1\BASE_DE_DATOS.md