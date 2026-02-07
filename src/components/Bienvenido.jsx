import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Bienvenido() {
  const [apartments, setApartments] = useState([]);
  const [tipoUsuarioName, setTipoUsuarioName] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false); // 🔹 Estado para minimizar
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hiddenOnMobile = ["Usuarios", "Dashboard"]; // Ejemplo de secciones ocultas

  useEffect(() => {
    const interfaz = () => {
      const nombre = localStorage.getItem("username");
      setTipoUsuarioName(nombre);
      const tipoUsuario = localStorage.getItem("tipo");

      switch (tipoUsuario) {
         case "1":
          setApartments([
            "Usuarios",
            "Fallas",
            "Desensamble",
            "Analisis",
            "Final",
            "Envios",
            "JOB",
            "Dashboard",
            "Record"
          ]);
          break;

        case "2":
          setApartments([
            "Fallas",
            "Desensamble",
            "Analisis",
            "Dashboard",
            "JOB",
            "Final",
          ]);
          break;
        case "3":
          setApartments([
            "Desensamble",
            "Analisis"
          ]);
          break;
        case "4":
          setApartments([
            "Dashboard",
            "Reporte"
          ]);
          break;
        default:
          setApartments([
            "Fallas",
            "Desensamble",
            "Analisis",
          ]);
          break;
      }

    };

    interfaz();
  }, []);

  return (
    <div className="bg-gray-900">
      {/*  Botón hamburguesa SOLO en mobile */}
      <button
        onClick={() => setIsMobileOpen(prev => !prev)}
        className=" fixed z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg md:hidden"
      >
        ☰
      </button>

      {/*  Overlay cuando el menú está abierto (mobile) */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* 📦 Sidebar */}
      <div
        className={`
      fixed md:relative z-50
      h-screen
      bg-gradient-to-b from-gray-900 to-black
      flex flex-col justify-between
      shadow-lg text-white
      transition-all duration-300
      mt-10
      w-64
      ${isCollapsed ? "md:w-20" : "md:w-64"}

      transform
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
    `}
      >
        {/* 🧩 Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-gray-300 font-semibold text-xl">
            {!isCollapsed && "Bienvenido"}
          </h1>


        </div>

        {/* 📁 Menú */}
        <div className="flex-1 px-3 flex flex-col gap-3 overflow-y-auto mt-2">
          {apartments.map((apartado, index) => (
            <Link
              key={index}
              to={`/${apartado}`}
              onClick={() => setIsMobileOpen(false)}
              className="
        bg-gray-800 hover:bg-gray-700 transition-all
        rounded-xl text-gray-200 font-medium shadow-md cursor-pointer
        text-center py-3
      "
            >
              {/* Mobile siempre texto completo */}
              <span className="block md:hidden">{apartado}</span>

              {/* Desktop respeta collapsed */}
              <span className="hidden md:block">
                {isCollapsed ? apartado.charAt(0) : apartado}
              </span>
            </Link>
          ))}
        </div>

        {/* 📆 Footer desktop */}
        <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-700 hidden md:block">
          {!isCollapsed && "© 2025 Infinitum Electric"}
        </div>
      </div>
    </div>

  );
}


export default Bienvenido;
