#!/bin/bash

read -sp "Ingresa la contraseña para desencriptar todos los .env.enc: " PASSWORD
echo

read -p "Ingresa la IP del servidor (e.g., 192.0.2.100 o midominio.com): " SERVER_IP
echo

# Lista de rutas donde buscar archivos .env.enc
RUTAS_ENV_ENC=(
  "./gps_backend"
  "./GPS-Pasivo-Papugrupo"
  "./tablero_backend"
  "./Tablero-2.0-Papugrupo/frontend"
)

echo "Desencriptando archivos .env.enc..."
for ruta in "${RUTAS_ENV_ENC[@]}"; do
  if [ -f "$ruta/.env.enc" ]; then
    echo "Desencriptando $ruta/.env.enc"
    openssl enc -aes-256-cbc -d -in "$ruta/.env.enc" -out "$ruta/.env" -pass pass:"$PASSWORD"
    if [ $? -ne 0 ]; then
      echo "Error desencriptando $ruta/.env.enc"
      exit 1
    fi
  fi
done

echo "Actualizando archivos .env de frontend con la IP del servidor: $SERVER_IP"

# Define the specific frontend .env file paths
TABLERO_FRONTEND_ENV="./Tablero-2.0-Papugrupo/frontend/.env"
GPS_FRONTEND_ENV="./GPS-Pasivo-Papugrupo/.env" # Assuming this is correct for GPS

# Update Tablero Frontend .env
if [ -f "$TABLERO_FRONTEND_ENV" ]; then
  echo "Procesando $TABLERO_FRONTEND_ENV"
  # VITE_BROKER_MQTT_URL='ws:mqtt_broker//:'  -> ws://${SERVER_IP}:6001
  sed -i "s|VITE_BROKER_MQTT_URL='ws:mqtt_broker//:'|VITE_BROKER_MQTT_URL='ws://${SERVER_IP}:6001'|" "$TABLERO_FRONTEND_ENV"
  # VITE_API_BACKEND=http://tablero_backend:  -> VITE_API_BACKEND=http://${SERVER_IP}:6039
  sed -i "s|VITE_API_BACKEND=http://tablero_backend:|VITE_API_BACKEND=http://${SERVER_IP}:6039|" "$TABLERO_FRONTEND_ENV"
  # Add VITE_URL_BASE if not present, or update if it is (based on your docker-compose.yml port 6041)
  if ! grep -q "VITE_URL_BASE=" "$TABLERO_FRONTEND_ENV"; then
    echo "VITE_URL_BASE=http://${SERVER_IP}:6041" >> "$TABLERO_FRONTEND_ENV"
  else
    sed -i "s|VITE_URL_BASE=.*|VITE_URL_BASE=http://${SERVER_IP}:6041|" "$TABLERO_FRONTEND_ENV"
  fi
  echo "  Updated $TABLERO_FRONTEND_ENV"
else
  echo "  Warning: $TABLERO_FRONTEND_ENV not found."
fi

if [ -f "$GPS_FRONTEND_ENV" ]; then
  echo "Procesando $GPS_FRONTEND_ENV"
  # VITE_API_BACKEND=http://localhost:7000  -> VITE_API_BACKEND=http://${SERVER_IP}:6038
  sed -i "s|VITE_API_BACKEND=http://localhost:7000|VITE_API_BACKEND=http://${SERVER_IP}:6038|" "$GPS_FRONTEND_ENV"
  # VITE_URL_BASE=http://localhost:5173  -> VITE_URL_BASE=http://${SERVER_IP}:6040
  sed -i "s|VITE_URL_BASE=http://localhost:5173|VITE_URL_BASE=http://${SERVER_IP}:6040|" "$GPS_FRONTEND_ENV"
  echo "  Updated $GPS_FRONTEND_ENV"
else
  echo "  Warning: $GPS_FRONTEND_ENV not found."
fi

RUTAS_FRONTEND=(
  "./Tablero-2.0-Papugrupo/frontend"
  "./GPS-Pasivo-Papugrupo"
)

echo "Ejecutando npm install y build en frontends..."
for ruta in "${RUTAS_FRONTEND[@]}"; do
  echo "Procesando $ruta"
  cd "$ruta" || { echo "Error: No se pudo cambiar al directorio $ruta"; exit 1; }
  npm install
  if [ $? -ne 0 ]; then
    echo "Error en npm install en $ruta"
    exit 1
  fi

  npm run build
  if [ $? -ne 0 ]; then
    echo "Error en npm run build en $ruta"
    exit 1
  fi
  cd - > /dev/null
done

echo "Ejecutando docker-compose..."
docker compose up -d --build

echo "Despliegue completo."