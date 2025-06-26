import React from "react";
export default function Sidebar({ isOpen, closeSidebar }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-primary text-black transform transition-transform duration-300 z-40 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Cierre */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-light)]">
        <h2 className="text-xl font-bold">Menú</h2>
        <button onClick={closeSidebar} className="text-black text-2xl cursor-pointer">
          &times;
        </button>
      </div>

      {/* Navegación */}
      <nav className="p-6 flex flex-col gap-4">
        <a href="/mapa" className="hover:text-[var(--color-secondary)]">Mapa</a>
        <a href="/registro-mascota" className="hover:text-[var(--color-secondary)]">Registrar Mascota</a>
      </nav>
    </aside>
  );
}
