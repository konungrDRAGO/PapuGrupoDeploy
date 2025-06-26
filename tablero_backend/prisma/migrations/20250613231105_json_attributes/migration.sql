-- AlterTable
ALTER TABLE "Tablero" ADD COLUMN     "FormatoTablero" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ejemploMensaje" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "AtributosJsonTablero" (
    "idAtributo" TEXT NOT NULL,
    "idTableroRef" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "AtributosJsonTablero_pkey" PRIMARY KEY ("idAtributo")
);

-- AddForeignKey
ALTER TABLE "AtributosJsonTablero" ADD CONSTRAINT "AtributosJsonTablero_idTableroRef_fkey" FOREIGN KEY ("idTableroRef") REFERENCES "Tablero"("idTablero") ON DELETE CASCADE ON UPDATE CASCADE;
