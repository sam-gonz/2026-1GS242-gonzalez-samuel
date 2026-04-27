# Lab 6 - Pruebas End-to-End con Playwright

## Descripción
Suite de pruebas automatizadas para el aplicativo PollClass (Laboratorio 1) utilizando Playwright.

## Estructura de Tests

```
2026-1gs242-gonzalez-samuel/Laboratorios/lab6/tests/
├── package.json
├── playwright.config.ts
├── README.md
└── tests/
    ├── 01-landing.spec.ts      # 6 tests - Página principal
    ├── 02-professor.spec.ts    # 10 tests - Panel del Profesor
    ├── 03-student.spec.ts     # 10 tests - Vista del Estudiante
    └── 04-validations.spec.ts # 10 tests - Validaciones de formularios
```

## Cómo ejecutar los tests

### Requisitos
- Node.js y npm
- Bun (para la app PollClass)
- MongoDB ejecutándose en localhost:27017

### Comandos
```bash
# Instalar dependencias (solo la primera vez)
npm install

# Instalar browsers de Playwright
npx playwright install chromium

# Ejecutar todos los tests
npm test

# Ejecutar con UI interactiva
npm run test:ui

# Ejecutar con ventana del navegador visible
npm run test:headed
```

## Flujos críticos testeados

### Flujo 1: Página Landing
- Visualización correcta de la página principal
- Navegación a Profesor/Estudiante
- Enlaces de retorno

### Flujo 2: Panel del Profesor
- Formulario de creación de encuestas
- Validación de campos requeridos
- Agregar hasta 10 opciones
- Crear encuesta exitosamente
- Filtros de encuestas

### Flujo 3: Vista del Estudiante
- Formulario de unión con código
- Validación de código (6 caracteres)
- Convertir código a mayúsculas
- Contador de caracteres

### Flujo 4: Validaciones (Casos Negativos)
- Título vacío
- Menos de 2 opciones
- Código con menos de 6 caracteres
- Caracteres especiales rechazados
- Límite de 100 caracteres en título

## Resultados
- **Total: 36 tests**
- **Pasando: 36 (100%)**
- **Fallando: 0**

## Notas
- La app PollClass debe estar ejecutándose en localhost:5173
- MongoDB debe estar disponible para los tests del profesor
- Los tests usan datos únicos (timestamps) para evitar conflictos