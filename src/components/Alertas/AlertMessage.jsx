// src/components/AlertMessage.jsx
import React, { useEffect } from "react";

const AlertMessage = ({ type = "success", message, onClose }) => {
  // Cierra automáticamente después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Colores y estilos según el tipo
  const styles = {
    success: "bg-green-500 text-black border-green-700",
    error: "bg-red-500 text-black border-red-700",
    warning: "bg-yellow-500 text-black border-yellow-700",
  };

  return (
    <div
      className={`fixed top-5 right-5 px-5 py-3 rounded-xl shadow-lg border ${styles[type]} transition-all duration-300 z-50`}
    >
      <p className="font-semibold">{message}</p>
    </div>
  );
};

export default AlertMessage;
