/*
  Warnings:

  - Added the required column `idGrupoRef` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "idGrupoRef" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Grupo" (
    "idGrupo" TEXT NOT NULL,
    "nombreGrupo" TEXT NOT NULL,
    "creadoPor" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("idGrupo")
);

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;
