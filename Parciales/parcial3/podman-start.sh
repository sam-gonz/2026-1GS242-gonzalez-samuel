#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

POD_NAME="parcial3-pod"
NET_NAME="parcial3-net"

echo "=== Creando red ==="
podman network create "$NET_NAME" 2>/dev/null || true

echo "=== Eliminando pod anterior (si existe) ==="
podman pod rm -f "$POD_NAME" 2>/dev/null || true

echo "=== Creando pod ==="
podman pod create --name "$POD_NAME" --network "$NET_NAME" \
  --publish 3000:3000 --publish 3001:3001 --publish 5173:5173 --publish 27017:27017

echo "=== Iniciando MongoDB ==="
podman run -d --pod "$POD_NAME" --name parcial3-mongo docker.io/mongo:7

echo "=== Construyendo imágenes ==="
podman build -t parcial3-backend:latest -f backend/Containerfile backend/
podman build -t parcial3-ai:latest -f ai-service/Containerfile ai-service/
podman build -t parcial3-frontend:latest -f frontend/Containerfile frontend/

echo "=== Iniciando backend ==="
podman run -d --pod "$POD_NAME" --name parcial3-backend \
  -e MONGO_URL="mongodb://localhost:27017/checkers" \
  -e AI_URL="http://localhost:3001" \
  -e FRONTEND_URL="http://localhost:5173" \
  -e STRIPE_SECRET="sk_test_51TQqezR8rQLvtJOTmkqszkpGIkaieAQ8aQCXJIPWdzyiPpjcEI5ZTU7Kt4hOCsUnEuLIVPk7apt1Gyl5Zvzv4dgt00HXS2u1j4" \
  -e STRIPE_WEBHOOK_SECRET="whsec_0bb38482b470edc3c35091fbc2e26c7b5cc45deb0ba8e821fb685f6d348756d4" \
  -e CLERK_SECRET_KEY="sk_test_wrCYzMJgiwVTlHBsgzTYtVVfcp1LwR6uG07NsYschX" \
  parcial3-backend:latest

echo "=== Iniciando AI ==="
podman run -d --pod "$POD_NAME" --name parcial3-ai parcial3-ai:latest

echo "=== Iniciando frontend ==="
podman run -d --pod "$POD_NAME" --name parcial3-frontend \
  -e VITE_CLERK_PUBLISHABLE_KEY="pk_test_bmVhdC1maWxseS0yLmNsZXJrLmFjY291bnRzLmRldiQ" \
  parcial3-frontend:latest

echo ""
echo "=== Esperando servicios ==="
sleep 8

for i in 1 2 3 4 5; do
  BE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")
  AI=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null || echo "000")
  FE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null || echo "000")
  if [ "$BE" = "200" ] && [ "$AI" = "200" ] && [ "$FE" != "000" ]; then
    echo "✅ Todos listos: Backend=$BE AI=$AI Frontend=$FE"
    break
  fi
  echo "⏳ Esperando... ($i/5) Backend=$BE AI=$AI Frontend=$FE"
  sleep 3
done

echo ""
echo "=============================================="
echo "  Backend:  http://localhost:3000"
echo "  AI:       http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo "  MongoDB:  localhost:27017"
echo "=============================================="
echo ""
echo "Para detener: podman pod stop $POD_NAME && podman pod rm -f $POD_NAME"
