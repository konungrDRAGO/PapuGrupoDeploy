-- DropForeignKey
ALTER TABLE "Mensajes" DROP CONSTRAINT "Mensajes_idTableroRef_fkey";

-- DropForeignKey
ALTER TABLE "Mensajes" DROP CONSTRAINT "Mensajes_idUsuarioRef_fkey";

-- AddForeignKey
ALTER TABLE "Mensajes" ADD CONSTRAINT "Mensajes_idTableroRef_fkey" FOREIGN KEY ("idTableroRef") REFERENCES "Tablero"("idTablero") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensajes" ADD CONSTRAINT "Mensajes_idUsuarioRef_fkey" FOREIGN KEY ("idUsuarioRef") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;
