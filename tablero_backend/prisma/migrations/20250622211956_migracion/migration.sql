/*
  Warnings:

  - You are about to drop the column `FormatoTablero` on the `Tablero` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tablero" DROP COLUMN "FormatoTablero",
ADD COLUMN     "formatoTablero" TEXT NOT NULL DEFAULT '';
