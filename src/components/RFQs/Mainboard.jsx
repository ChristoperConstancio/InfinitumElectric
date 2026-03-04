import React, { useState } from "react";
import AlertMessage from "../Alertas/AlertMessage";
import { buscarMainBoard } from "../../customHooks/RFQ";

function FormMainBoard() {
  const [snMainBoard, setSNMainBoard] = useState("");
  const [resultado, setResultado] = useState(null);
  const [alert, setAlert] = useState(null);

  const handleBuscar = async (e) => {
    e.preventDefault();

    if (!snMainBoard.trim()) {
      setAlert({ type: "error", message: "Ingresa un SN MainBoard válido." });
      return;
    }

    try {
      const data = await buscarMainBoard(snMainBoard);

      if (data) {
        setResultado(data);
        setAlert({ type: "success", message: "Registro encontrado." });
      } else {
        setResultado(null);
        setAlert({
          type: "error",
          message: "No se encontró ningún registro con ese SN_MainBoard.",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Error al buscar el SN_MainBoard." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-b from-gray-950 to-gray-900 text-white shadow-2xl rounded-2xl p-10 mt-10 border border-blue-500">
      <h2 className="text-3xl font-bold mb-10 text-blue-400 text-center">
        Buscar Razón de Falla por SN_MainBoard
      </h2>

      {/* Formulario de búsqueda */}
      <form
        onSubmit={handleBuscar}
        className="mb-10 flex flex-col sm:flex-row items-end gap-4"
      >
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            SN MainBoard
          </label>
          <input
            type="text"
            value={snMainBoard}
            onChange={(e) => setSNMainBoard(e.target.value)}
            placeholder="Escanear SN MainBoard..."
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-black font-semibold rounded-lg px-8 py-3 hover:bg-blue-400 transition-all w-full sm:w-auto"
        >
          Buscar
        </button>
      </form>

      {/* Alertas */}
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Resultado */}
      {resultado && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-6">
            Información del Rechazo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">JOB</label>
              <input
                type="text"
                value={resultado.JOB || ""}
                readOnly
                className="w-full bg-gray-900 text-gray-300 border border-gray-700 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Estación
              </label>
              <input
                type="text"
                value={resultado.Estacion || ""}
                readOnly
                className="w-full bg-gray-900 text-gray-300 border border-gray-700 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Razón del Fallo
              </label>
              <input
                type="text"
                value={resultado.Razon || ""}
                readOnly
                className="w-full bg-gray-900 text-gray-300 border border-gray-700 rounded-lg p-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormMainBoard;