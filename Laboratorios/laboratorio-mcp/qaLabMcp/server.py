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
import sys
import tempfile
from enum import Enum
from typing import Any

from mcp.server.fastmcp import FastMCP

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger("qaLabMcp")

mcp = FastMCP("qaLabMcp")

DATOS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "datos_prueba.json")


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
        logger.info("validar_cliente -> INVALIDO: %s", errores)
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
    if any(p in escenario_lower for p in ("invalido", "invalida", "incorrecto", "erroneo", "inválid")):
        caso["datos_entrada"] = {"username": "usuario_invalido", "password": "clave_erronea"}
        caso["resultado_esperado"] = {"status_code": 401, "mensaje": "Credenciales inválidas", "token": None}
    elif any(p in escenario_lower for p in ("exitoso", "exitosa", "valido", "valida", "correcto", "correcta", "válid")):
        caso["datos_entrada"] = {"username": "usuario_test", "password": "clave_correcta"}
        caso["resultado_esperado"] = {"status_code": 200, "mensaje": "Login exitoso", "token": "<jwt_token>"}
    elif any(p in escenario_lower for p in ("vacio", "vacia", "sin datos", "vacío")):
        caso["datos_entrada"] = {}
        caso["resultado_esperado"] = {"status_code": 400, "mensaje": "Campos requeridos faltantes"}
    else:
        caso["datos_entrada"] = {"parametro": "valor_de_prueba"}
        caso["resultado_esperado"] = {"status_code": 200, "mensaje": "Respuesta esperada según el escenario"}

    return caso


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


if __name__ == "__main__":
    logger.info("Iniciando servidor qaLabMcp (stdio)...")
    mcp.run(transport="stdio")
