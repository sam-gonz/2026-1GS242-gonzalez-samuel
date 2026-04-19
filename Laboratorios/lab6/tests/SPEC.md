# Plan de Desarrollo - Lab 6: Pruebas End-to-End con Playwright

## Objetivo
Automatizar la validación del laboratorio 5 (PollClass) mediante pruebas E2E con Playwright.

## Estructura del Proyecto
- Ubicación: `2026-1gs242-gonzalez-samuel/laboratorios/lab6/tests`
- Base app: `Laboratorios/Lab1/pollclass`

## Flujos Críticos Identificados

### Flujo 1: Landing Page
- Visualización correcta de página principal
- Navegación a Profesor/Estudiante
- Enlaces de retorno

### Flujo 2: Panel del Profesor
- Formulario de creación de encuestas
- Validación de campos requeridos
- Agregar opciones (2-10)
- Crear encuesta exitosamente

### Flujo 3: Vista del Estudiante
- Formulario de unión con código
- Validación de código (6 caracteres)
- Convertir código a mayúsculas
- Contador de caracteres

### Flujo 4: Validaciones (Casos Negativos)
- Código inválido (menos de 6 caracteres)
- Nombre vacío
- Título de encuesta vacío

## Bitácora del Agente

### Lo que pedí al agente
- Crear suite completa de tests E2E con Playwright para PollClass
- Mínimo 3 flujos críticos más casos negativos
- Tests que funcionen automáticamente

### Lo que acepté del agente
- Configuración de Playwright con webServer automático
- 4 archivos de tests separados por funcionalidad
- 36 tests cubriendo flujos principales y validaciones

### Lo que corregí yo
- Tests que fallaban por locators ambiguos usé selectores más específicos
- Validaciones de UI (botón deshabilitado) en lugar de click
- Títulos únicos con timestamps para evitar duplicados

### Cómo validé
- Suite completa: 36/36 tests pasando
- Ejecución en ~5 segundos
- Browser Chromium configurado automáticamente
-MongoDB debe estar corriendo

## Resultados Finales
- **Total: 36 tests**
- **Pasando: 36 (100%)**
- **Fallando: 0**

## Cómo ejecutar los tests
```bash
# En el directorio lab6/tests
npm install
npx playwright install chromium
npm test
```