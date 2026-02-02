import React, { useState } from "react";
import AlertMessage from "../Alertas/AlertMessage";
import { buscarVFD } from "../../customHooks/RFQ";

function FormVFD() {
  const [snVFD, setSNVFD] = useState("");
  const [resultado, setResultado] = useState(null);
  const [alert, setAlert] = useState(null);

  const [reemplazos, setReemplazos] = useState({
    CIM: false,
    Inverter: false,
    MainBoard: false,
  });

  const [nuevosSN, setNuevosSN] = useState({
    SN_CIM: "",
    SN_Inverter: "",
    SN_MainBoard: "",
    Comentarios: "",
  });

  // Checkbox handler
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setReemplazos((prev) => ({ ...prev, [name]: checked }));
  };

  // Input changes (nuevos SN)
  const handleNewSNChange = (e) => {
    const { name, value } = e.target;
    setNuevosSN((prev) => ({ ...prev, [name]: value }));
  };

  // Buscar VFD
  const handleBuscar = async (e) => {
    e.preventDefault();
    try {
      const data = await buscarVFD(snVFD);
      if (data) {
        setResultado(data);
        setAlert({ type: "success", message: "Registro encontrado." });
      } else {
        setResultado(null);
        setAlert({ type: "error", message: "No se encontró ningún registro con ese SN." });
      }
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Error al buscar el SN." });
    }
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Aquí puedes crear la lógica para guardar en Firebase según los campos seleccionados…
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-b from-gray-950 to-gray-900 text-white shadow-2xl rounded-2xl p-10 mt-10 border border-red-500">
      <h2 className="text-3xl font-bold mb-10 text-red-400 text-center">Buscar Rechazo por Serial de VFD</h2>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleBuscar} className="mb-10 flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium mb-2 text-gray-300">SN VFD</label>
          <input type="text" onChange={(e) => setSNVFD(e.target.value)} placeholder="Ingresa SN VFD..." className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none" />
        </div>

        <button type="submit" className="bg-red-500 text-black font-semibold rounded-lg px-8 py-3 hover:bg-red-400 transition-all w-full sm:w-auto">Buscar</button>
      </form>

      {/* Alertas */}
      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Formulario principal */}
      {resultado && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-200">Selecciona las tarjetas a reemplazar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["CIM", "Inverter", "MainBoard"].map((item) => (
              <label key={item} className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" name={item} checked={reemplazos[item]} onChange={handleCheckboxChange} className="h-5 w-5 text-red-500" />
                <span>{item}</span>
              </label>
            ))}
          </div>

          {/* Inputs dinámicos */}
          {reemplazos.MainBoard && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Nuevo SN Main Board</label>
              <input type="text" name="SN_MainBoard" value={nuevosSN.SN_MainBoard} onChange={handleNewSNChange} placeholder="Escanear SN Main Board..." className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-2" />
            </div>
          )}

          {reemplazos.Inverter && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Nuevo SN Inverter</label>
              <input type="text" name="SN_Inverter" value={nuevosSN.SN_Inverter} onChange={handleNewSNChange} placeholder="Escanear SN Inverter..." className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-2" />
            </div>
          )}

          {reemplazos.CIM && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Nuevo SN CIM</label>
              <input type="text" name="SN_CIM" value={nuevosSN.SN_CIM} onChange={handleNewSNChange} placeholder="Escanear SN CIM..." className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-2" />
            </div>
          )}

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Comentarios</label>
            <textarea name="Comentarios" value={nuevosSN.Comentarios} onChange={handleNewSNChange} placeholder="Comentarios sobre análisis o reemplazo..." className="w-full bg-gray-800 text-white rounded-lg p-3 h-28 resize-none" />
          </div>

          <button type="submit" className="w-full bg-green-500 text-black font-semibold rounded-xl py-2 hover:bg-green-400 transition-all">Guardar cambios</button>
        </form>
      )}
    </div>
  );
}

export default FormVFD;