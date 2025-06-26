-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "CodigoVerificacion" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CodigoVerificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tablero" (
    "idTablero" TEXT NOT NULL,
    "nombreGrupo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tablero_pkey" PRIMARY KEY ("idTablero")
);

-- CreateTable
CREATE TABLE "Mensajes" (
    "idMensaje" TEXT NOT NULL,
    "idTableroRef" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "velocidad" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "idUsuarioRef" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mensajes_pkey" PRIMARY KEY ("idMensaje")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "CodigoVerificacion_correo_key" ON "CodigoVerificacion"("correo");

-- AddForeignKey
ALTER TABLE "Mensajes" ADD CONSTRAINT "Mensajes_idTableroRef_fkey" FOREIGN KEY ("idTableroRef") REFERENCES "Tablero"("idTablero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensajes" ADD CONSTRAINT "Mensajes_idUsuarioRef_fkey" FOREIGN KEY ("idUsuarioRef") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
