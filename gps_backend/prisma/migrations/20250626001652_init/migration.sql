-- CreateTable
CREATE TABLE "Cliente" (
    "idCliente" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("idCliente")
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
CREATE TABLE "Mascota" (
    "idMascota" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raza" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "color" TEXT,
    "tamano" TEXT,
    "esterilizado" BOOLEAN,
    "numeroMicrochip" TEXT,
    "fechaMicrochip" TIMESTAMP(3),
    "urlFoto" TEXT,
    "vacunasAlDia" BOOLEAN,
    "fechaDesparasitacion" TIMESTAMP(3),
    "condicionesMedicas" TEXT,
    "nombreVeterinario" TEXT,
    "telefonoVeterinario" TEXT,
    "comportamiento" TEXT,
    "observaciones" TEXT,
    "idClienteRef" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mascota_pkey" PRIMARY KEY ("idMascota")
);

-- CreateTable
CREATE TABLE "Ubicaciones" (
    "idUbicacion" TEXT NOT NULL,
    "idMascota" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombreReportante" TEXT,
    "comentario" TEXT,

    CONSTRAINT "Ubicaciones_pkey" PRIMARY KEY ("idUbicacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_correo_key" ON "Cliente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "CodigoVerificacion_correo_key" ON "CodigoVerificacion"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Mascota_numeroMicrochip_key" ON "Mascota"("numeroMicrochip");

-- AddForeignKey
ALTER TABLE "Mascota" ADD CONSTRAINT "Mascota_idClienteRef_fkey" FOREIGN KEY ("idClienteRef") REFERENCES "Cliente"("idCliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ubicaciones" ADD CONSTRAINT "Ubicaciones_idMascota_fkey" FOREIGN KEY ("idMascota") REFERENCES "Mascota"("idMascota") ON DELETE RESTRICT ON UPDATE CASCADE;
