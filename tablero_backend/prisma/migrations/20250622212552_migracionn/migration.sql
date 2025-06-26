/*
  Warnings:

  - You are about to drop the column `formatoTablero` on the `Tablero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tablero" DROP COLUMN "formatoTablero",
ADD COLUMN     "formatoMensaje" TEXT NOT NULL DEFAULT '';
