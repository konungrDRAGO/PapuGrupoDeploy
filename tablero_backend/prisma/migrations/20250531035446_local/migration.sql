-- CreateEnum
CREATE TYPE "TipoAnimacion" AS ENUM ('PA_SCROLL_LEFT', 'PA_SCROLL_UP', 'PA_SCROLL_DOWN', 'PA_SCROLL_RIGHT', 'PA_WIPE', 'PA_CLOSING', 'PA_OPENING', 'PA_FADE', 'PA_NO_EFFECT');

-- AlterTable
ALTER TABLE "Mensajes" ADD COLUMN     "animacion" "TipoAnimacion" NOT NULL DEFAULT 'PA_SCROLL_LEFT';

-- AlterTable
ALTER TABLE "Tablero" ADD COLUMN     "nombreTablero" TEXT NOT NULL DEFAULT '';
