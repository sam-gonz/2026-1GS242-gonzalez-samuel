# Plan Corregido — Servidor MCP Local con GitHub Copilot

> **Materia:** Desarrollo de Software 9
> **Laboratorio:** 12 — Servidor MCP local con GitHub Copilot en VS Code
> **Duración sugerida:** 60 minutos
> **Vence:** 24 de junio de 2026, 23:00

---

## 1. Contexto y Diagnóstico del Plan Original

Este documento es una **versión corregida y mejorada** del plan original entregado para el laboratorio. Se identificaron varias debilidades técnicas y pedagógicas que se corrigen a continuación.

### 1.1 Tabla comparativa: Plan original vs. Plan corregido

| Aspecto | Plan original | Plan corregido |
|---|---|---|
| Validación de tipos en tools | Inexistente | Estricta con type hints y guards |
| Manejo de errores | Mínimo o nulo | try/except + mensajes claros |
| Docstrings | Una línea | Estilo Google (Args/Returns/Raises) |
| Tests unitarios | No incluidos | pytest con cobertura de las 7 tools |
| Guía de debugging | Tips sueltos | Sección dedicada con flujos de solución |
| Reto 4 | Solo lectura (GET) | CRUD completo (GET, POST, PUT, DELETE) |
| Compatibilidad SO | Solo Windows | Windows, Linux y macOS |
| Logging | No hay | Módulo `logging` con salida a stderr |
| Persistencia del JSON | No contemplada | Escritura atómica y validación |
| Prompts de prueba | Básicos | Específicos con resultado esperado |

### 1.2 Debilidades identificadas en el plan original

1. **Validación débil:** `calcular_percentil_simple` no valida que la lista contenga números; una entrada mixta (strings) lanzaría excepción no controlada.
2. **Sin tests:** no había forma de verificar las funciones sin pasar por Copilot.
3. **Docstrings mínimos:** dificultan entender parámetros y retornos al revisar el código.
4. **Reto 4 simplista:** leer JSON es trivial; el laboratorio desaprovecha la oportunidad de practicar escritura y actualización.
5. **Falta de debugging:** si el servidor no arrancaba, el usuario no tenía guía estructurada.
6. **Sin manejo de errores de I/O:** el `buscar_cliente` original podía fallar silenciosamente ante un JSON corrupto o permisos denegados.
7. **Windows-only:** el comando `python` puede ser `python3` o `py` en otros sistemas.

---

## 2. Estructura del Proyecto

### 2.1 Arquitectura general

```
┌──────────────────┐    protocolo MCP (stdio)    ┌──────────────────┐
│  GitHub Copilot  │ ◄─────────────────────────► │  server.py       │
│  (Cliente/Agent) │    JSON-RPC sobre stdin/     │  (FastMCP)       │
│                  │    stdout                    │                  │
└──────────────────┘                              └────────┬─────────┘
                                                             │
                                                             ▼
                                                    ┌──────────────────┐
                                                    │  Tools (7)       │
                                                    │  • validar_...   │
                                                    │  • generar_...   │
                                                    │  • calcular_...  │
                                                    │  • clasificar_.. │
                                                    │  • evaluar_sla   │
                                                    │  • validar_res.. │
                                                    │  • CRUD cliente  │
                                                    └────────┬─────────┘
                                                             │
                                                             ▼
                                                    ┌──────────────────┐
                                                    │ datos_prueba.json│
                                                    └──────────────────┘
```

### 2.2 Estructura de carpetas del proyecto

```
qaLabMcp/
├── .vscode/
│   └── mcp.json                # Registro del servidor para VS Code
├── server.py                   # Servidor FastMCP con 7 tools
├── datos_prueba.json           # Base de datos JSON de clientes
├── tests/
│   └── test_server.py          # Tests unitarios con pytest
├── .gitignore                  # Exclusiones estándar Python/VSCode
├── README.md                   # Documentación del proyecto
└── requirements.txt            # Dependencias: mcp[cli], pytest
```

---

## 3. Fases de Implementación

### Fase 1 — Preparación del entorno (5 min)

**Objetivo:** tener Python, VS Code y Copilot listos.

1. Crear la carpeta `qaLabMcp` y abrirla con `File > Open Folder` (no solo el archivo).
2. Verificar Python según el sistema operativo:
   - **Windows:** `python --version`
   - **Linux/macOS:** `python3 --version`
3. Instalar el SDK de MCP y pytest:
   ```bash
   # Windows
   python -m pip install "mcp[cli]" pytest

   # Linux/macOS
   python3 -m pip install "mcp[cli]" pytest
   ```
4. Confirmar que GitHub Copilot Chat tiene sesión iniciada (icono en la barra inferior).
5. Crear y activar un entorno virtual (recomendado):
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # Linux/macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

### Fase 2 — Implementación de `server.py` (15 min)

Crear `qaLabMcp/server.py` con el código de la sección 4.1. Características del código:

- 3 tools base + 4 retos = 7 tools en total.
- Type hints estrictos en todas las funciones.
- Docstrings estilo Google.
- Validación de entradas al inicio de cada tool.
- Logging con `logging` para visibilidad en el panel Output de VS Code.

### Fase 3 — Creación de `datos_prueba.json` (2 min)

Crear `qaLabMcp/datos_prueba.json` con 5 clientes (sección 4.2).

### Fase 4 — Registro en `.vscode/mcp.json` (2 min)

Crear `qaLabMcp/.vscode/mcp.json` según el sistema operativo (sección 4.3).

**Regla importante:** no ejecutar `python server.py` en otra terminal. VS Code gestiona el proceso stdio automáticamente.

### Fase 5 — Tests unitarios (5 min) — NUEVO

Crear `qaLabMcp/tests/test_server.py` con pytest (sección 4.4).

Ejecutar los tests:
```bash
python -m pytest tests/ -v
```

Si todos pasan, el servidor está listo para Copilot.

### Fase 6 — Compilación y arranque (3 min)

1. Compilar para verificar sintaxis:
   ```bash
   # Windows
   python -m py_compile server.py

   # Linux/macOS
   python3 -m py_compile server.py
   ```
2. Arrancar el servidor desde VS Code:
   - `Ctrl+Shift+P` → **MCP: List Servers**
   - Seleccionar `qaLabMcp` → **Start Server**
3. Verificar que el ícono del servidor aparece en verde en la barra de estado.

### Fase 7 — Pruebas desde Copilot Chat (10 min)

Abrir Copilot Chat (`Ctrl+Alt+I`), cambiar a modo **Agent** y ejecutar los prompts de la sección 6.

### Fase 8 — Retos prácticos (15 min)

Implementar las 4 tools adicionales de la sección 5. **Orden sugerido:**

1. Reto 1 — Básico: `clasificar_error_http`
2. Reto 2 — Intermedio: `evaluar_sla`
3. Reto 3 — Intermedio: `validar_respuesta_api`
4. Reto 4 — Avanzado: CRUD de clientes

Después de agregar cada tool, **reiniciar el servidor** desde VS Code (`MCP: List Servers` → Stop → Start).

### Fase 9 — Debugging y troubleshooting (3 min)

Si algo falla, consultar la sección 7 antes de pedir ayuda.

---

## 4. Código Fuente Completo y Corregido

### 4.1 `server.py`

```python
"""
Servidor MCP local para el laboratorio 12.

Expone 7 herramientas (tools) consumibles desde GitHub Copilot en modo Agent:
    1. validar_cliente
    2. generar_caso_prueba
    3. calcular_percentil_simple
    4. clasificar_error_http
    5. evaluar_sla
    6. validar_respuesta_api
    7. CRUD de clientes (buscar, agregar, actualizar, eliminar)

Protocolo: MCP sobre stdio.
"""

from __future__ import annotations

import json
import logging
import math
import os
import re
import tempfile
from enum import Enum
from typing import Any

from mcp.server.fastmcp import FastMCP

# ──────────────────────────────────────────────────────────────────────
# Configuración de logging (se ve en Output > MCP de VS Code)
# ──────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=__import__("sys").stderr,
)
logger = logging.getLogger("qaLabMcp")

mcp = FastMCP("qaLabMcp")

# Ruta al archivo de datos (misma carpeta que server.py)
DATOS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datos_prueba.json")


# ──────────────────────────────────────────────────────────────────────
# TOOL 1 (base) — validar_cliente
# ──────────────────────────────────────────────────────────────────────
@mcp.tool()
def validar_cliente(cip: str, telefono: str, email: str) -> dict[str, Any]:
    """Valida y normaliza los datos de un cliente.

    Args:
        cip: Cédula panameña (4 a 10 dígitos).
        telefono: Teléfono en formato XXXX-XXXX.
        email: Correo electrónico.

    Returns:
        Diccionario con:
            - valido (bool): True si todos los campos son válidos.
            - errores (list[str]): lista de mensajes de error (si los hay).
            - datos_normalizados (dict): CIP, teléfono y email limpios.

    Raises:
        TypeError: si algún argumento no es string.
    """
    if not isinstance(cip, str) or not isinstance(telefono, str) or not isinstance(email, str):
        raise TypeError("cip, telefono y email deben ser strings.")

    errores: list[str] = []
    cip_limpio = cip.strip()
    tel_limpio = telefono.strip()
    email_limpio = email.strip().lower()

    if not re.fullmatch(r"\d{4,10}", cip_limpio):
        errores.append("CIP inválido: debe contener entre 4 y 10 dígitos numéricos.")

    if not re.fullmatch(r"\d{4}-\d{4}", tel_limpio):
        errores.append("Teléfono inválido: debe tener el formato XXXX-XXXX (ej. 6677-8899).")

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email_limpio):
        errores.append("Correo electrónico inválido.")

    if errores:
        logger.info("validar_cliente → INVÁLIDO: %s", errores)
        return {"valido": False, "errores": errores}

    return {
        "valido": True,
        "datos_normalizados": {
            "cip": cip_limpio,
            "telefono": tel_limpio,
            "email": email_limpio,
        },
        "mensaje": "Cliente validado correctamente.",
    }


# ──────────────────────────────────────────────────────────────────────
# TOOL 2 (base) — generar_caso_prueba
# ──────────────────────────────────────────────────────────────────────
class MetodoHTTP(str, Enum):
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"


@mcp.tool()
def generar_caso_prueba(endpoint: str, metodo: str, escenario: str) -> dict[str, Any]:
    """Genera un caso de prueba funcional para un endpoint REST.

    Args:
        endpoint: Ruta del endpoint (ej. "/api/login").
        metodo: Método HTTP (GET, POST, PUT, PATCH, DELETE).
        escenario: Descripción del escenario (ej. "credenciales inválidas").

    Returns:
        Diccionario con id_caso, datos_entrada, pasos, resultado_esperado.
        Si el método es inválido, retorna {"error": "..."}.
    """
    try:
        metodo_enum = MetodoHTTP(metodo.strip().upper())
    except ValueError:
        return {
            "error": f"Método HTTP no reconocido: {metodo}. "
            f"Use uno de {[m.value for m in MetodoHTTP]}."
        }

    caso: dict[str, Any] = {
        "id_caso": f"TC_{metodo_enum.value}_{endpoint.replace('/', '_').strip('_')}",
        "endpoint": endpoint,
        "metodo": metodo_enum.value,
        "escenario": escenario,
        "precondiciones": [
            "El servidor API debe estar corriendo.",
            "La base de datos de prueba debe estar inicializada.",
        ],
        "datos_entrada": {},
        "pasos": [
            f"1. Enviar petición {metodo_enum.value} a {endpoint}",
            f"2. Pasar el escenario: '{escenario}'",
            "3. Capturar código de respuesta HTTP.",
            "4. Capturar cuerpo de respuesta JSON.",
        ],
        "resultado_esperado": {},
        "tipo": "funcional",
    }

    escenario_lower = escenario.lower()
    if any(p in escenario_lower for p in ("invalido", "incorrecto", "erroneo", "inválid")):
        caso["datos_entrada"] = {"username": "usuario_invalido", "password": "clave_erronea"}
        caso["resultado_esperado"] = {"status_code": 401, "mensaje": "Credenciales inválidas", "token": None}
    elif any(p in escenario_lower for p in ("exitoso", "valido", "correcto", "válid")):
        caso["datos_entrada"] = {"username": "usuario_test", "password": "clave_correcta"}
        caso["resultado_esperado"] = {"status_code": 200, "mensaje": "Login exitoso", "token": "<jwt_token>"}
    elif any(p in escenario_lower for p in ("vacio", "sin datos", "vacío")):
        caso["datos_entrada"] = {}
        caso["resultado_esperado"] = {"status_code": 400, "mensaje": "Campos requeridos faltantes"}
    else:
        caso["datos_entrada"] = {"parametro": "valor_de_prueba"}
        caso["resultado_esperado"] = {"status_code": 200, "mensaje": "Respuesta esperada según el escenario"}

    return caso


# ──────────────────────────────────────────────────────────────────────
# TOOL 3 (base) — calcular_percentil_simple
# ──────────────────────────────────────────────────────────────────────
@mcp.tool()
def calcular_percentil_simple(valores: list[float], percentil: float) -> dict[str, Any]:
    """Calcula un percentil mediante interpolación lineal.

    Args:
        valores: Lista de números (int o float).
        percentil: Valor entre 0 y 100.

    Returns:
        Diccionario con percentil, resultado, valores_ordenados,
        total_valores e interpretación. Si hay error, retorna {"error": "..."}.
    """
    if not valores:
        return {"error": "La lista de valores no puede estar vacía."}

    if not all(isinstance(v, (int, float)) and not isinstance(v, bool) for v in valores):
        return {"error": "Todos los elementos de 'valores' deben ser numéricos."}

    if not (0 <= percentil <= 100):
        return {"error": "El percentil debe estar entre 0 y 100."}

    ordenados = sorted(valores)
    n = len(ordenados)
    indice = (percentil / 100) * (n - 1)
    inferior = math.floor(indice)
    superior = math.ceil(indice)

    if inferior == superior:
        resultado = float(ordenados[inferior])
    else:
        fraccion = indice - inferior
        resultado = ordenados[inferior] + fraccion * (ordenados[superior] - ordenados[inferior])

    return {
        "percentil": percentil,
        "resultado": round(resultado, 2),
        "valores_ordenados": ordenados,
        "total_valores": n,
        "interpretacion": f"El {percentil}% de los valores es menor o igual a {round(resultado, 2)}",
    }


# ──────────────────────────────────────────────────────────────────────
# RETO 1 (Básico) — clasificar_error_http
# ──────────────────────────────────────────────────────────────────────
@mcp.tool()
def clasificar_error_http(status_code: int) -> dict[str, Any]:
    """Clasifica un código HTTP en su categoría semántica.

    Args:
        status_code: Código de estado HTTP (entero).

    Returns:
        Diccionario con status_code, categoria y descripcion.
    """
    if not isinstance(status_code, int):
        return {"error": "status_code debe ser un entero."}

    if 200 <= status_code <= 299:
        categoria, descripcion = "Éxito", "La solicitud fue procesada correctamente."
    elif 300 <= status_code <= 399:
        categoria, descripcion = "Redirección", "Se requiere una acción adicional para completar la solicitud."
    elif 400 <= status_code <= 499:
        categoria, descripcion = "Error del cliente", "La solicitud contiene errores del lado del cliente."
    elif 500 <= status_code <= 599:
        categoria, descripcion = "Error del servidor", "El servidor falló al procesar una solicitud válida."
    else:
        categoria, descripcion = "Desconocido", "Código de estado HTTP no estándar."

    return {"status_code": status_code, "categoria": categoria, "descripcion": descripcion}


# ──────────────────────────────────────────────────────────────────────
# RETO 2 (Intermedio) — evaluar_sla
# ──────────────────────────────────────────────────────────────────────
@mcp.tool()
def evaluar_sla(p95_ms: float, limite_ms: float) -> dict[str, Any]:
    """Evalúa si el p95 de latencia cumple con el SLA definido.

    Args:
        p95_ms: Percentil 95 observado en milisegundos.
        limite_ms: Límite de SLA en milisegundos.

    Returns:
        Diccionario con p95_ms, limite_ms, cumple_sla, diferencia_ms y mensaje.
    """
    if p95_ms < 0 or limite_ms < 0:
        return {"error": "p95_ms y limite_ms deben ser no negativos."}

    cumple = p95_ms <= limite_ms
    diferencia = round(limite_ms - p95_ms, 2)

    return {
        "p95_ms": p95_ms,
        "limite_ms": limite_ms,
        "cumple_sla": cumple,
        "diferencia_ms": diferencia,
        "mensaje": (
            f"✅ CUMPLE el SLA. Margen disponible: {diferencia} ms."
            if cumple
            else f"❌ NO CUMPLE el SLA. Excede en {abs(diferencia)} ms."
        ),
    }


# ──────────────────────────────────────────────────────────────────────
# RETO 3 (Intermedio) — validar_respuesta_api
# ──────────────────────────────────────────────────────────────────────
@mcp.tool()
def validar_respuesta_api(
    status_code: int,
    tiempo_ms: float,
    limite_ms: float,
    tiene_token: bool,
) -> dict[str, Any]:
    """Valida una respuesta de API bajo tres condiciones simultáneas.

    La respuesta es válida si y solo si:
        - status_code está en el rango 2xx.
        - tiempo_ms no supera limite_ms.
        - tiene_token es True.

    Args:
        status_code: Código HTTP devuelto.
        tiempo_ms: Tiempo de respuesta en milisegundos.
        limite_ms: Límite permitido en milisegundos.
        tiene_token: Si la respuesta incluye token de autenticación.

    Returns:
        Diccionario con valida, veredicto, checks y resumen.
    """
    es_2xx = 200 <= status_code <= 299
    cumple_tiempo = tiempo_ms <= limite_ms
    checks = {
        "status_2xx": {
            "resultado": es_2xx,
            "detalle": f"Status {status_code} {'es' if es_2xx else 'no es'} 2xx",
        },
        "tiempo_dentro_limite": {
            "resultado": cumple_tiempo,
            "detalle": f"{tiempo_ms}ms {'≤' if cumple_tiempo else '>'} {limite_ms}ms",
        },
        "token_presente": {
            "resultado": tiene_token,
            "detalle": "Token presente" if tiene_token else "Token ausente",
        },
    }

    es_valida = es_2xx and cumple_tiempo and tiene_token

    return {
        "valida": es_valida,
        "veredicto": "✅ VÁLIDA" if es_valida else "❌ INVÁLIDA",
        "checks": checks,
        "resumen": (
            f"Status={status_code}, Tiempo={tiempo_ms}ms (límite {limite_ms}ms), "
            f"Token={'sí' if tiene_token else 'no'}"
        ),
    }


# ──────────────────────────────────────────────────────────────────────
# RETO 4 (Avanzado) — CRUD de clientes sobre datos_prueba.json
# ──────────────────────────────────────────────────────────────────────
def _cargar_datos() -> dict[str, Any]:
    """Carga el JSON de datos. Lanza IOError si no se puede leer."""
    if not os.path.exists(DATOS_PATH):
        raise FileNotFoundError(f"No se encontró el archivo: {DATOS_PATH}")
    with open(DATOS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _guardar_datos(datos: dict[str, Any]) -> None:
    """Escribe el JSON de forma atómica para evitar corrupción."""
    dir_name = os.path.dirname(DATOS_PATH)
    with tempfile.NamedTemporaryFile(
        "w", dir=dir_name, delete=False, encoding="utf-8"
    ) as tmp:
        json.dump(datos, tmp, indent=2, ensure_ascii=False)
        tmp_path = tmp.name
    os.replace(tmp_path, DATOS_PATH)


@mcp.tool()
def buscar_cliente(cip: str) -> dict[str, Any]:
    """Busca un cliente por CIP en datos_prueba.json.

    Args:
        cip: Cédula del cliente a buscar.

    Returns:
        Si lo encuentra: {"encontrado": True, "cliente": {...}}.
        Si no: {"encontrado": False, "mensaje": "..."}.
    """
    try:
        datos = _cargar_datos()
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return {"error": str(e)}

    for cliente in datos.get("clientes", []):
        if str(cliente.get("cip", "")).strip() == str(cip).strip():
            return {"encontrado": True, "cliente": cliente}
    return {"encontrado": False, "mensaje": f"No se encontró ningún cliente con CIP '{cip}'."}


@mcp.tool()
def agregar_cliente(cip: str, nombre: str, telefono: str, email: str, estado: str = "activo") -> dict[str, Any]:
    """Agrega un nuevo cliente al JSON.

    Args:
        cip, nombre, telefono, email, estado: datos del nuevo cliente.
        estado: "activo" o "inactivo" (por defecto "activo").

    Returns:
        Confirmación con los datos agregados o un error si el CIP ya existe.
    """
    if estado not in ("activo", "inactivo"):
        return {"error": "estado debe ser 'activo' o 'inactivo'."}

    try:
        datos = _cargar_datos()
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return {"error": str(e)}

    clientes = datos.setdefault("clientes", [])
    if any(str(c.get("cip")) == str(cip) for c in clientes):
        return {"error": f"Ya existe un cliente con CIP {cip}."}

    nuevo = {"cip": cip, "nombre": nombre, "telefono": telefono, "email": email, "estado": estado}
    clientes.append(nuevo)
    _guardar_datos(datos)
    return {"agregado": True, "cliente": nuevo}


@mcp.tool()
def actualizar_cliente(cip: str, nombre: str | None = None, telefono: str | None = None,
                       email: str | None = None, estado: str | None = None) -> dict[str, Any]:
    """Actualiza campos de un cliente existente. Solo modifica los campos no nulos.

    Args:
        cip: Identificador del cliente a actualizar.
        nombre, telefono, email, estado: nuevos valores (opcionales).

    Returns:
        Confirmación con el cliente actualizado o un error si no existe.
    """
    try:
        datos = _cargar_datos()
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return {"error": str(e)}

    for cliente in datos.get("clientes", []):
        if str(cliente.get("cip")) == str(cip):
            if nombre is not None:
                cliente["nombre"] = nombre
            if telefono is not None:
                cliente["telefono"] = telefono
            if email is not None:
                cliente["email"] = email
            if estado is not None:
                if estado not in ("activo", "inactivo"):
                    return {"error": "estado debe ser 'activo' o 'inactivo'."}
                cliente["estado"] = estado
            _guardar_datos(datos)
            return {"actualizado": True, "cliente": cliente}

    return {"error": f"No existe cliente con CIP {cip}."}


@mcp.tool()
def eliminar_cliente(cip: str) -> dict[str, Any]:
    """Elimina un cliente del JSON.

    Args:
        cip: Identificador del cliente a eliminar.

    Returns:
        Confirmación de eliminación o error si no existe.
    """
    try:
        datos = _cargar_datos()
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return {"error": str(e)}

    clientes = datos.get("clientes", [])
    for i, cliente in enumerate(clientes):
        if str(cliente.get("cip")) == str(cip):
            eliminado = clientes.pop(i)
            datos["clientes"] = clientes
            _guardar_datos(datos)
            return {"eliminado": True, "cliente": eliminado}

    return {"error": f"No existe cliente con CIP {cip}."}


# ──────────────────────────────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logger.info("Iniciando servidor qaLabMcp (stdio)...")
    mcp.run(transport="stdio")
```

### 4.2 `datos_prueba.json`

```json
{
  "clientes": [
    {
      "cip": "12345",
      "nombre": "Juan Pérez",
      "telefono": "6677-8899",
      "email": "juan.perez@demo.com",
      "estado": "activo"
    },
    {
      "cip": "67890",
      "nombre": "María González",
      "telefono": "6123-4567",
      "email": "maria.gonzalez@demo.com",
      "estado": "activo"
    },
    {
      "cip": "11111",
      "nombre": "Carlos Rodríguez",
      "telefono": "6999-0001",
      "email": "carlos.rodriguez@demo.com",
      "estado": "inactivo"
    },
    {
      "cip": "22222",
      "nombre": "Ana López",
      "telefono": "6543-2109",
      "email": "ana.lopez@demo.com",
      "estado": "activo"
    },
    {
      "cip": "99999",
      "nombre": "Luis Martínez",
      "telefono": "6000-1234",
      "email": "luis.martinez@demo.com",
      "estado": "activo"
    }
  ]
}
```

### 4.3 `.vscode/mcp.json` (variantes por SO)

**Windows:**
```json
{
  "servers": {
    "qaLabMcp": {
      "type": "stdio",
      "command": "python",
      "args": ["${workspaceFolder}/server.py"]
    }
  }
}
```

**Linux/macOS:**
```json
{
  "servers": {
    "qaLabMcp": {
      "type": "stdio",
      "command": "python3",
      "args": ["${workspaceFolder}/server.py"]
    }
  }
}
```

> En Windows también se puede usar `"command": "py"` si `python` no funciona.

### 4.4 `tests/test_server.py` (NUEVO)

```python
"""
Tests unitarios para qaLabMcp.

Ejecutar con:
    python -m pytest tests/ -v
"""

import json
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Permite importar server.py desde la raíz del proyecto
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import server  # noqa: E402


# ──────────────────────────────────────────────────────────────────────
# Tests: validar_cliente
# ──────────────────────────────────────────────────────────────────────
def test_validar_cliente_exitoso():
    r = server.validar_cliente("12345", "6677-8899", "PRUEBA@DEMO.COM")
    assert r["valido"] is True
    assert r["datos_normalizados"]["email"] == "prueba@demo.com"


def test_validar_cliente_invalido():
    r = server.validar_cliente("12", "66778899", "no-es-email")
    assert r["valido"] is False
    assert len(r["errores"]) == 3


def test_validar_cliente_tipo_incorrecto():
    with pytest.raises(TypeError):
        server.validar_cliente(12345, "6677-8899", "a@b.c")  # type: ignore


# ──────────────────────────────────────────────────────────────────────
# Tests: generar_caso_prueba
# ──────────────────────────────────────────────────────────────────────
def test_generar_caso_invalidas():
    r = server.generar_caso_prueba("/api/login", "POST", "credenciales inválidas")
    assert r["metodo"] == "POST"
    assert r["resultado_esperado"]["status_code"] == 401


def test_generar_caso_exitoso():
    r = server.generar_caso_prueba("/api/login", "POST", "login exitoso")
    assert r["resultado_esperado"]["status_code"] == 200
    assert r["resultado_esperado"]["token"] == "<jwt_token>"


def test_generar_caso_metodo_invalido():
    r = server.generar_caso_prueba("/api/x", "FOO", "cualquier cosa")
    assert "error" in r


# ──────────────────────────────────────────────────────────────────────
# Tests: calcular_percentil_simple
# ──────────────────────────────────────────────────────────────────────
def test_percentil_95_basico():
    r = server.calcular_percentil_simple([120, 130, 150, 300, 90, 100, 500, 220], 95)
    assert r["total_valores"] == 8
    assert r["resultado"] > 300  # p95 alto por el outlier 500


def test_percentil_lista_vacia():
    r = server.calcular_percentil_simple([], 50)
    assert "error" in r


def test_percentil_lista_mixta():
    r = server.calcular_percentil_simple([1, "dos", 3], 50)  # type: ignore
    assert "error" in r


def test_percentil_fuera_de_rango():
    r = server.calcular_percentil_simple([1, 2, 3], 150)
    assert "error" in r


# ──────────────────────────────────────────────────────────────────────
# Tests: clasificar_error_http
# ──────────────────────────────────────────────────────────────────────
def test_clasificar_500():
    r = server.clasificar_error_http(500)
    assert r["categoria"] == "Error del servidor"


def test_clasificar_404():
    r = server.clasificar_error_http(404)
    assert r["categoria"] == "Error del cliente"


def test_clasificar_200():
    r = server.clasificar_error_http(200)
    assert r["categoria"] == "Éxito"


# ──────────────────────────────────────────────────────────────────────
# Tests: evaluar_sla
# ──────────────────────────────────────────────────────────────────────
def test_sla_cumple():
    r = server.evaluar_sla(480, 500)
    assert r["cumple_sla"] is True
    assert r["diferencia_ms"] == 20


def test_sla_no_cumple():
    r = server.evaluar_sla(600, 500)
    assert r["cumple_sla"] is False


# ──────────────────────────────────────────────────────────────────────
# Tests: validar_respuesta_api
# ──────────────────────────────────────────────────────────────────────
def test_respuesta_valida():
    r = server.validar_respuesta_api(200, 350, 500, True)
    assert r["valida"] is True


def test_respuesta_invalida_por_token():
    r = server.validar_respuesta_api(200, 350, 500, False)
    assert r["valida"] is False


def test_respuesta_invalida_por_tiempo():
    r = server.validar_respuesta_api(200, 600, 500, True)
    assert r["valida"] is False


# ──────────────────────────────────────────────────────────────────────
# Tests: CRUD sobre datos_prueba.json (con archivo temporal)
# ──────────────────────────────────────────────────────────────────────
@pytest.fixture
def datos_temp(monkeypatch):
    """Crea un JSON temporal y hace que server apunte a él."""
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
        json.dump({"clientes": []}, f)
        ruta = f.name
    monkeypatch.setattr(server, "DATOS_PATH", ruta)
    yield ruta
    os.unlink(ruta)


def test_agregar_y_buscar_cliente(datos_temp):
    r = server.agregar_cliente("12345", "Test", "6677-8899", "t@x.com")
    assert r["agregado"] is True

    b = server.buscar_cliente("12345")
    assert b["encontrado"] is True
    assert b["cliente"]["nombre"] == "Test"


def test_agregar_duplicado(datos_temp):
    server.agregar_cliente("12345", "Test", "6677-8899", "t@x.com")
    r = server.agregar_cliente("12345", "Otro", "1111-2222", "o@x.com")
    assert "error" in r


def test_actualizar_cliente(datos_temp):
    server.agregar_cliente("12345", "Test", "6677-8899", "t@x.com")
    r = server.actualizar_cliente("12345", nombre="Test Actualizado")
    assert r["actualizado"] is True
    assert r["cliente"]["nombre"] == "Test Actualizado"


def test_eliminar_cliente(datos_temp):
    server.agregar_cliente("12345", "Test", "6677-8899", "t@x.com")
    r = server.eliminar_cliente("12345")
    assert r["eliminado"] is True

    b = server.buscar_cliente("12345")
    assert b["encontrado"] is False
```

### 4.5 `requirements.txt`

```
mcp[cli]>=1.0.0
pytest>=8.0.0
```

### 4.6 `.gitignore`

```
__pycache__/
*.py[cod]
.venv/
.env
.pytest_cache/
```

---

## 5. Retos Prácticos (orden de implementación)

### Reto 1 — Básico: `clasificar_error_http` ✅

**Implementado en sección 4.1.** Categoriza códigos HTTP en Éxito / Redirección / Error del cliente / Error del servidor.

**Prueba:**
```
Usa la tool clasificar_error_http con status_code 500
```
**Resultado esperado:** `categoria: "Error del servidor"`.

### Reto 2 — Intermedio: `evaluar_sla` ✅

**Implementado en sección 4.1.** Evalúa cumplimiento de SLA con cálculo de margen.

**Prueba:**
```
Usa la tool evaluar_sla con p95_ms 480 y limite_ms 500
```
**Resultado esperado:** `cumple_sla: true`, `diferencia_ms: 20`.

### Reto 3 — Intermedio: `validar_respuesta_api` ✅

**Implementado en sección 4.1.** Valida una respuesta bajo 3 condiciones: 2xx, tiempo y token.

**Prueba:**
```
Usa la tool validar_respuesta_api con status_code 200, tiempo_ms 350, limite_ms 500 y tiene_token true
```
**Resultado esperado:** `valida: true`.

### Reto 4 — Avanzado: CRUD de clientes (MEJORADO) ✅

En el plan original solo había `buscar_cliente`. Esta versión incluye **4 tools** que operan sobre `datos_prueba.json`:

| Tool | Método | Descripción |
|---|---|---|
| `buscar_cliente(cip)` | GET | Lee y devuelve un cliente por CIP |
| `agregar_cliente(cip, nombre, telefono, email, estado)` | POST | Inserta un nuevo cliente |
| `actualizar_cliente(cip, ...)` | PUT | Modifica campos de un cliente existente |
| `eliminar_cliente(cip)` | DELETE | Borra un cliente por CIP |

**Mejoras clave:**
- Escritura atómica con `tempfile` + `os.replace` (evita JSON corrupto si el proceso muere a mitad de escritura).
- Validación de `estado` ∈ {activo, inactivo}.
- Manejo de CIPs duplicados en `agregar_cliente`.

**Pruebas:**
```
# GET
Usa la tool buscar_cliente con CIP 12345

# POST
Usa la tool agregar_cliente con cip 33333, nombre Pedro, telefono 6000-1111, email pedro@demo.com

# PUT
Usa la tool actualizar_cliente con cip 12345 y nombre Juan Pérez Actualizado

# DELETE
Usa la tool eliminar_cliente con cip 33333
```

---

## 6. Prompts de Prueba para Copilot Chat (modo Agent)

### Pruebas base (3 obligatorias)

**A) `validar_cliente`:**
```
Usa la tool validar_cliente con CIP 12345, teléfono 6677-8899 y correo prueba@demo.com
```
**Resultado esperado:** `valido: true`, email normalizado a minúsculas.

**B) `generar_caso_prueba`:**
```
Usa la tool generar_caso_prueba para el endpoint POST /api/login con el escenario credenciales inválidas
```
**Resultado esperado:** `id_caso: TC_POST_api_login`, `status_code: 401`.

**C) `calcular_percentil_simple`:**
```
Usa la tool calcular_percentil_simple para el percentil 95 de los valores [120, 130, 150, 300, 90, 100, 500, 220]
```
**Resultado esperado:** p95 ≈ 415 (interpolación entre 300 y 500).

### Pruebas de retos (4 obligatorias)

**Reto 1:**
```
Usa la tool clasificar_error_http con status_code 500
```

**Reto 2:**
```
Usa la tool evaluar_sla con p95_ms 480 y limite_ms 500
```

**Reto 3:**
```
Usa la tool validar_respuesta_api con status_code 200, tiempo_ms 350, limite_ms 500 y tiene_token true
```

**Reto 4 (4 sub-pruebas):**
```
# GET
Usa la tool buscar_cliente con CIP 12345

# POST
Usa la tool agregar_cliente con cip 33333, nombre Pedro, telefono 6000-1111, email pedro@demo.com

# PUT
Usa la tool actualizar_cliente con cip 12345 y nombre Juan Pérez Actualizado

# DELETE
Usa la tool eliminar_cliente con cip 33333
```

---

## 7. Guía de Debugging

### 7.1 Cómo ver los logs del servidor

1. En VS Code: `View > Output` (o `Ctrl+Shift+U`).
2. En el dropdown superior derecho seleccionar **MCP**.
3. Verás los mensajes de `logging` emitidos por `server.py`.

### 7.2 Errores comunes y soluciones

| Error | Causa probable | Solución |
|---|---|---|
| Servidor no aparece en `MCP: List Servers` | La carpeta no está abierta como proyecto | `File > Open Folder` y seleccionar `qaLabMcp` |
| `ModuleNotFoundError: No module named 'mcp'` | `pip install` se hizo en otro Python | Usar `python -m pip install "mcp[cli]"` con el mismo Python que VS Code |
| `python: command not found` (Linux/Mac) | Comando es `python3` | Cambiar `command` en `mcp.json` a `python3` |
| Tools no aparecen en Copilot Chat | El servidor no terminó de arrancar | `MCP: List Servers` → Stop → Start |
| `Permission denied` al escribir JSON | Falta de permisos en la carpeta | No usar `sudo`; ajustar permisos del usuario |
| JSON corrupto tras un crash | Escritura no atómica | El código corregido usa `tempfile` + `os.replace` |
| Copilot no detecta las tools tras edit | VS Code no recargó | Reiniciar el servidor manualmente |

### 7.3 Comandos de diagnóstico rápido

```bash
# Verificar versión de Python
python --version  # o python3 --version

# Verificar instalación del SDK
python -c "import mcp; print(mcp.__version__)"

# Verificar compilación
python -m py_compile server.py

# Ejecutar tests
python -m pytest tests/ -v

# Probar el servidor en modo debug (Linux/Mac)
# ADVERTENCIA: no hacer esto si VS Code ya lo está ejecutando
python3 server.py
```

### 7.4 Reglas de oro

- **No** ejecutar `python server.py` en otra terminal mientras VS Code lo gestiona.
- **Sí** reiniciar el servidor desde VS Code cada vez que se modifique `server.py`.
- **Sí** revisar el panel `Output > MCP` para ver logs de las tools.
- **Sí** correr los tests antes de invocar las tools desde Copilot.

---

## 8. Entregables

### 8.1 Archivos del repositorio

| Archivo | Propósito | Obligatorio |
|---|---|---|
| `server.py` | Servidor MCP con 7 tools | ✅ |
| `.vscode/mcp.json` | Registro del servidor | ✅ |
| `datos_prueba.json` | 5 clientes de prueba | ✅ |
| `tests/test_server.py` | Tests unitarios | ✅ (NUEVO) |
| `requirements.txt` | Dependencias | ✅ (NUEVO) |
| `README.md` | Documentación del proyecto | Recomendado |
| `.gitignore` | Exclusiones | Recomendado |

### 8.2 Evidencias requeridas (capturas)

Para cada una de las 7 pruebas (3 base + 4 retos) capturar:

1. **Captura 1:** la tool visible en el selector de Copilot Chat (panel de tools).
2. **Captura 2:** el prompt exacto enviado.
3. **Captura 3:** el resultado JSON devuelto.

**Total mínimo: 21 capturas** (7 pruebas × 3 evidencias).

### 8.3 Estructura recomendada del repo GitHub

```
qaLabMcp/
├── .vscode/
│   └── mcp.json
├── tests/
│   └── test_server.py
├── server.py
├── datos_prueba.json
├── requirements.txt
├── .gitignore
├── README.md
└── docs/
    └── evidencia/
        ├── 01-validar-cliente.png
        ├── 02-generar-caso-prueba.png
        ├── 03-calcular-percentil.png
        ├── 04-reto1-clasificar-error.png
        ├── 05-reto2-evaluar-sla.png
        ├── 06-reto3-validar-respuesta.png
        ├── 07-reto4-buscar.png
        ├── 08-reto4-agregar.png
        ├── 09-reto4-actualizar.png
        └── 10-reto4-eliminar.png
```

---

## 9. Criterios de Aceptación

- [ ] `server.py` compila sin errores (`python -m py_compile server.py`)
- [ ] Los 7 tests unitarios pasan (`pytest tests/ -v`)
- [ ] El servidor aparece y arranca desde `MCP: List Servers`
- [ ] Las 3 tools base son invocables desde Copilot en modo Agent
- [ ] Los 4 retos (incluido CRUD completo) funcionan correctamente
- [ ] El JSON persiste los cambios tras reiniciar el servidor
- [ ] Se incluyen todas las capturas de evidencia
- [ ] El repositorio GitHub contiene los 6 archivos obligatorios
- [ ] El `README.md` documenta cómo levantar el proyecto en menos de 5 pasos

---

## 10. Referencias Oficiales

- [VS Code — MCP Servers](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [GitHub Copilot — MCP](https://docs.github.com/en/copilot/customizing-copilot/using-model-context-protocol/extending-copilot-chat-with-mcp)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [pytest — documentación](https://docs.pytest.org/)

