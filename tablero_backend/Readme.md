# Comandos útiles


## Iniciar backend
```
npm run dev
```

## Instalar dependencias
```
npm install
```

## Mostrar la base de datos en Web
Se crea una sesión de prisma en el navegador que permite mostrar la base de datos.

```
npx prisma studio
```

## Migrar base de datos [Comando Destructivo]

Este comando ejecuta el schema actual ubicado en `/prisma/schema.prisma` en la base de datos. Puede generar pérdida de datos si los cambios son muy grandes.

```
npx prisma migrate dev --name 'Nombre_migración'
```