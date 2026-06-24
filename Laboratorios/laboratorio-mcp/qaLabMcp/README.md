# qaLabMcp

Servidor MCP local en Python con 7 herramientas para QA, expuesto a GitHub Copilot en modo Agent dentro de VS Code.

## Requisitos

- Python 3.10+
- VS Code con la extensión **Python** y **GitHub Copilot Chat**
- SDK MCP: `python3 -m pip install -r requirements.txt`

## Instalación (5 pasos)

```bash
# 1. Abrir esta carpeta en VS Code (File > Open Folder)
# 2. Crear entorno virtual
python3 -m venv .venv && source .venv/bin/activate

# 3. Instalar dependencias
python3 -m pip install -r requirements.txt

# 4. Compilar
python3 -m py_compile server.py

# 5. Arrancar servidor desde VS Code: Ctrl+Shift+P > MCP: List Servers > qaLabMcp > Start Server
```

## Herramientas expuestas

| Tool | Tipo | Descripción |
|---|---|---|
| `validar_cliente` | Base | Valida CIP, teléfono y email |
| `generar_caso_prueba` | Base | Genera un caso de prueba REST |
| `calcular_percentil_simple` | Base | Calcula percentiles por interpolación |
| `clasificar_error_http` | Reto 1 | Categoriza códigos HTTP |
| `evaluar_sla` | Reto 2 | Evalúa cumplimiento de SLA |
| `validar_respuesta_api` | Reto 3 | Valida status, tiempo y token |
| `buscar_cliente` | Reto 4 | Busca un cliente por CIP |
| `agregar_cliente` | Reto 4 | Agrega un cliente al JSON |
| `actualizar_cliente` | Reto 4 | Modifica un cliente existente |
| `eliminar_cliente` | Reto 4 | Borra un cliente del JSON |

## Tests

```bash
python3 -m pytest tests/ -v
```

## Estructura

```
qaLabMcp/
├── .vscode/mcp.json        # Registro del servidor para VS Code
├── server.py                # Servidor FastMCP con 10 tools
├── datos_prueba.json        # 5 clientes de prueba
├── tests/test_server.py     # Tests con pytest
├── requirements.txt
├── .gitignore
└── README.md
```

## Prompts de prueba para Copilot Chat (modo Agent)

```
# Pruebas base
Usa la tool validar_cliente con CIP 12345, teléfono 6677-8899 y correo prueba@demo.com
Usa la tool generar_caso_prueba para el endpoint POST /api/login con el escenario credenciales inválidas
Usa la tool calcular_percentil_simple para el percentil 95 de los valores [120, 130, 150, 300, 90, 100, 500, 220]

# Retos
Usa la tool clasificar_error_http con status_code 500
Usa la tool evaluar_sla con p95_ms 480 y limite_ms 500
Usa la tool validar_respuesta_api con status_code 200, tiempo_ms 350, limite_ms 500 y tiene_token true
Usa la tool buscar_cliente con CIP 12345
Usa la tool agregar_cliente con cip 33333, nombre Pedro, telefono 6000-1111, email pedro@demo.com
Usa la tool actualizar_cliente con cip 12345 y nombre Juan Pérez Actualizado
Usa la tool eliminar_cliente con cip 33333
```

## Referencias

- [VS Code — MCP Servers](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [GitHub Copilot — MCP](https://docs.github.com/en/copilot/customizing-copilot/using-model-context-protocol/extending-copilot-chat-with-mcp)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
