## Bitacora Agentica - Lab 6

### ¿Qué le pedí al agente? 
hay que hacer una prueba completa de todo el aplicativo, pero dividiendolo por archivo, por archivos de test cases. que sean bien especificos para que funcione con playwright. no solo el sunny day o happy path. ejecutar un script de playwright. es decir no usar el mcp. testear el 100% de la app. Creame un plan de desarrollo para revisar e ir aplicando

### ¿Qué acepté?
4 archivos de test serparados por funcionalidad + 36 tests cubirnedo flujos principales y validaciones y configuracion con webserver automatico

### Lo que corregí yo (interractivamente)
- Locators ambiguos - selectores específicos (getByRole, getByPlaceholder)
- Tests que intentaban click en botón deshabilitado - verifiqué UI con toBeDisabled()
- Títulos duplicados - usé timestamps para títulos únicos

### Cómo validé
- ejecute npm test dentro de la carpeta de tests y pasaron el 100% de estos tests