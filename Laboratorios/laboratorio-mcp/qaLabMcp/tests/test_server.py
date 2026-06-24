"""
Tests unitarios para qaLabMcp.

Ejecutar con:
    python3 -m pytest tests/ -v
"""

import json
import os
import sys
import tempfile
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import server  # noqa: E402


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
        server.validar_cliente(12345, "6677-8899", "a@b.c")


def test_generar_caso_invalidas():
    r = server.generar_caso_prueba("/api/login", "POST", "credenciales inválidas")
    assert r["metodo"] == "POST"
    assert r["resultado_esperado"]["status_code"] == 401


def test_generar_caso_invalidas_sin_tilde():
    r = server.generar_caso_prueba("/api/login", "POST", "credenciales invalidas")
    assert r["resultado_esperado"]["status_code"] == 401


def test_generar_caso_exitoso():
    r = server.generar_caso_prueba("/api/login", "POST", "login exitoso")
    assert r["resultado_esperado"]["status_code"] == 200
    assert r["resultado_esperado"]["token"] == "<jwt_token>"


def test_generar_caso_metodo_invalido():
    r = server.generar_caso_prueba("/api/x", "FOO", "cualquier cosa")
    assert "error" in r


def test_percentil_95_basico():
    r = server.calcular_percentil_simple([120, 130, 150, 300, 90, 100, 500, 220], 95)
    assert r["total_valores"] == 8
    assert r["resultado"] > 300


def test_percentil_lista_vacia():
    r = server.calcular_percentil_simple([], 50)
    assert "error" in r


def test_percentil_lista_mixta():
    r = server.calcular_percentil_simple([1, "dos", 3], 50)
    assert "error" in r


def test_percentil_fuera_de_rango():
    r = server.calcular_percentil_simple([1, 2, 3], 150)
    assert "error" in r


def test_clasificar_500():
    r = server.clasificar_error_http(500)
    assert r["categoria"] == "Error del servidor"


def test_clasificar_404():
    r = server.clasificar_error_http(404)
    assert r["categoria"] == "Error del cliente"


def test_clasificar_200():
    r = server.clasificar_error_http(200)
    assert r["categoria"] == "Éxito"


def test_sla_cumple():
    r = server.evaluar_sla(480, 500)
    assert r["cumple_sla"] is True
    assert r["diferencia_ms"] == 20


def test_sla_no_cumple():
    r = server.evaluar_sla(600, 500)
    assert r["cumple_sla"] is False


def test_respuesta_valida():
    r = server.validar_respuesta_api(200, 350, 500, True)
    assert r["valida"] is True


def test_respuesta_invalida_por_token():
    r = server.validar_respuesta_api(200, 350, 500, False)
    assert r["valida"] is False


def test_respuesta_invalida_por_tiempo():
    r = server.validar_respuesta_api(200, 600, 500, True)
    assert r["valida"] is False


@pytest.fixture
def datos_temp(monkeypatch):
    """Crea un JSON temporal y hace que server apunte a él."""
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
        json.dump({"clientes": []}, f)
        ruta = f.name
    monkeypatch.setattr(server, "DATOS_PATH", ruta)
    yield ruta
    if os.path.exists(ruta):
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
