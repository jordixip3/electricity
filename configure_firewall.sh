#!/bin/bash

# ==============================================================================
# Script de Configuración del Firewall para la Base de Datos Oracle (10.0.2.15)
# ==============================================================================
#
# OBJETIVO:
# Configurar iptables en el servidor Oracle (10.0.2.15) para que únicamente acepte
# conexiones al puerto 1521 (Oracle Listener) provenientes de la máquina donde
# corre la aplicación web, bloqueando cualquier otro acceso desde el exterior/Internet.
#
# INSTRUCCIONES:
# 1. Copia este script al servidor Oracle (10.0.2.15).
# 2. Reemplaza la variable WEB_APP_IP con la IP real del servidor de la App Web.
# 3. Ejecuta el script con privilegios de root (sudo).
# ==============================================================================

# IP de la máquina que ejecuta la Aplicación Web (Backend Docker)
WEB_APP_IP="10.0.2.20" # <-- REEMPLAZAR con la IP real de tu máquina Web App

# Puerto por defecto del Listener de Oracle
ORACLE_PORT=1521

echo "=========================================================="
echo " Iniciando configuración de seguridad en Oracle DB"
echo "=========================================================="
echo "-> IP de la Base de Datos (Local): 10.0.2.15"
echo "-> IP del Servidor Web Autorizado: $WEB_APP_IP"
echo "-> Puerto a Proteger: $ORACLE_PORT"
echo "=========================================================="

# 1. Asegurar que las herramientas necesarias están disponibles
if ! command -v iptables &> /dev/null; then
    echo "[ERROR] 'iptables' no está instalado en este sistema. Instálalo para continuar."
    exit 1
fi

# 2. Permitir conexiones locales (loopback) para mantenimiento local de Oracle
echo "[+] Permitiendo tráfico local (localhost)..."
iptables -A INPUT -i lo -j ACCEPT

# 3. Permitir conexiones al Listener (1521) únicamente desde el servidor web autorizado
echo "[+] Autorizando tráfico al Listener (puerto $ORACLE_PORT) desde la IP $WEB_APP_IP..."
iptables -A INPUT -p tcp -s "$WEB_APP_IP" --dport "$ORACLE_PORT" -j ACCEPT

# 4. (Opcional) Si la aplicación corre en la misma máquina física que la base de datos (Docker Bridge)
# Autorizar el rango de subred por defecto de Docker (por ejemplo, 172.16.0.0/12)
echo "[+] Autorizando tráfico interno de contenedores Docker (172.16.0.0/12)..."
iptables -A INPUT -p tcp -s 172.16.0.0/12 --dport "$ORACLE_PORT" -j ACCEPT

# 5. Bloquear cualquier otro intento de conexión al puerto 1521 (tanto local como de Internet)
echo "[+] Bloqueando el acceso externo general al puerto $ORACLE_PORT..."
iptables -A INPUT -p tcp --dport "$ORACLE_PORT" -j DROP

# 6. Guardar las reglas para que persistan tras reiniciar el sistema
echo "[+] Guardando reglas de firewall..."
if command -v iptables-save &> /dev/null; then
    # Para Debian/Ubuntu (requiere iptables-persistent)
    if [ -f /etc/iptables/rules.v4 ]; then
        iptables-save > /etc/iptables/rules.v4
        echo "[OK] Reglas guardadas en /etc/iptables/rules.v4"
    # Para RHEL/CentOS/Oracle Linux
    elif [ -f /etc/sysconfig/iptables ]; then
        iptables-save > /etc/sysconfig/iptables
        echo "[OK] Reglas guardadas en /etc/sysconfig/iptables"
    else
        echo "[!] Reglas aplicadas con éxito pero no persistidas de forma automática."
        echo "    Por favor, instala 'iptables-persistent' o ejecuta 'service iptables save' para guardarlas permanentemente."
    fi
fi

echo "=========================================================="
echo " Configuración del Firewall Completada con Éxito!"
echo "=========================================================="
echo "Las conexiones a Oracle (10.0.2.15:1521) ahora están limitadas"
echo "exclusivamente a la IP $WEB_APP_IP y la subred de Docker."
echo "Cualquier otro escaneo o intento de conexión exterior será ignorado."
echo "=========================================================="
