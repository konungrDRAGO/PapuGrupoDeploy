#!/bin/bash

read -sp "Ingresa la contraseña para desencriptar todos los .env.enc: " PASSWORD
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
    echo "$ruta/.env.enc"
    openssl enc -aes-256-cbc -d -in "$ruta/.env.enc" -out "$ruta/.env" -pass pass:"$PASSWORD"
    if [ $? -ne 0 ]; then
      echo "Error desencriptando $ruta/.env.enc"
      exit 1
    fi
  fi
done

# Lista de carpetas que contienen frontend con package.json
RUTAS_FRONTEND=(
  "./Tablero-2.0-Papugrupo/frontend"
  "./GPS-Pasivo-Papugrupo"
)

echo "Ejecutando npm install y build en frontends..."
for ruta in "${RUTAS_FRONTEND[@]}"; do
  echo "Procesando $ruta"
  cd "$ruta"
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
