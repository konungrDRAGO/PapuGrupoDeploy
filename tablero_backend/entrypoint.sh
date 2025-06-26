#!/bin/sh

echo "Esperando a la base de datos..."
until pg_isready -h $DB_HOST -p 5432 -U $DB_USER; do
  sleep 1
done

echo "Base de datos disponible. Aplicando migraciones..."
npx prisma migrate deploy

echo "Iniciando aplicación..."
npm start
