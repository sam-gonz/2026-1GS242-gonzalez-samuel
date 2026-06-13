#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

POD_NAME="parcial3-pod"
NET_NAME="parcial3-net"

echo "=== Stopping pod ==="
podman pod stop "$POD_NAME" 2>/dev/null && echo "Pod stopped" || echo "No pod running"

echo "=== Removing pod ==="
podman pod rm -f "$POD_NAME" 2>/dev/null && echo "Pod removed" || echo "No pod to remove"

echo "=== Removing network ==="
podman network rm "$NET_NAME" 2>/dev/null && echo "Network removed" || echo "Network already cleaned"

echo "=== Done ==="
