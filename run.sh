#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "    ⚡ Proyecto Electricidad (Fullstack EMS & BESS)"
echo "=========================================================="

# Check if docker-compose should be used or direct dev servers
if command -v docker &> /dev/null && docker compose ps &> /dev/null; then
    echo "[+] Verificando contenedores Docker..."
    docker compose up -d
    echo "[✓] Docker compose iniciado."
fi

# Check if Vite frontend is running, otherwise start
if ! lsof -i :5173 > /dev/null 2>&1; then
    echo "[+] Iniciando Frontend Vite (puerto 5173)..."
    cd "$DIR/frontend" && npm run dev &
    cd "$DIR"
fi

# Check if Spring Boot backend is running, otherwise start
if ! lsof -i :8080 > /dev/null 2>&1; then
    echo "[+] Iniciando Backend Spring Boot (puerto 8080)..."
    cd "$DIR/backend" && mvn spring-boot:run &
    cd "$DIR"
fi

echo "=========================================================="
echo "  [✓] Frontend React (Vite): http://localhost:5173"
echo "  [✓] Backend Spring Boot:   http://localhost:8080"
echo "=========================================================="
