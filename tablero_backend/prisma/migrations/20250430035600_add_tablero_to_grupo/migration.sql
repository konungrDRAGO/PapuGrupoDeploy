/*
  Warnings:

  - Added the required column `idGrupoRef` to the `Tablero` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tablero" ADD COLUMN     "idGrupoRef" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Tablero" ADD CONSTRAINT "Tablero_idGrupoRef_fkey" FOREIGN KEY ("idGrupoRef") REFERENCES "Grupo"("idGrupo") ON DELETE RESTRICT ON UPDATE CASCADE;
