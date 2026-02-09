import React, { useState, useEffect, } from 'react'
import { useNavigate } from 'react-router-dom'
import { addRechazos } from '../../customHooks/RFQ';
import AlertMessage from '../Alertas/AlertMessage';

function RegistroRechazos() {

  const navigate = useNavigate(); // hook para navegación
  const [tipo, setTipo] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [formData, setFormData] = useState({
    Tipo: "",
    SN_Motor: "",
    SN_VFD: "",
    SN_Catalog: "",
    Estacion: "",
    Fecha: "",
    Auditor: "",
    Razon: "",
    Status: "Rechazado",
    JOB: "",

  });

  // Generar fecha actual en formato MM/DD/YYYY
  useEffect(() => {
    const hoy = new Date();
    const fechaHoraMX = hoy.toLocaleDateString("en-US", {
      timeZone: "America/Mexico_City",
    });
    setFormData((prev) => ({ ...prev, Fecha: fechaHoraMX }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "Tipo") setTipo(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auditor = localStorage.getItem('username')
    const nuevoResultado = {
      ...formData,
      Auditor: auditor,
    };

    const isOk = await addRechazos(nuevoResultado);

    if (isOk) {
      setAlert({ show: true, type: "success", message: "Motor procesado!" });
      navigate('/fallas')
      return;
    }
    setAlert({ show: false, type: "error", message: "Fallo en la conexion a la base de datos" })

  };

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-b from-gray-900 to-black text-white shadow-xl rounded-2xl p-6 mt-10 border border-red-400">
      <h2 className="text-2xl font-bold mb-6 text-red-400 text-center">Registro de Rechazos</h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Tipo</label>
          <select
            name="Tipo"
            value={formData.Tipo}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
            required
          >
            <option value="">Selecciona...</option>
            <option value="Sistema">Sistema</option>
            <option value="Motor">Motor</option>
            <option value="VFD">VFD</option>
          </select>
        </div>
        {alert && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}

          />
        )}
        {/* Campos condicionales */}
        {formData.Tipo === "Sistema" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Serial Motor</label>
              <input
                type="text"
                name="SN_Motor"
                value={formData.SN_Motor}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
                placeholder="Ingrese serial del motor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Serial VFD</label>
              <input
                type="text"
                name="SN_VFD"
                value={formData.SN_VFD}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
                placeholder="Ingrese serial del VFD"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Serial Catalog</label>
              <input
                type="text"
                name="SN_Catalog"
                value={formData.SN_Catalog}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
                placeholder="Ingrese serial del catálogo"
                required
              />
            </div>
          </>
        )}

        {formData.Tipo === "Motor" && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Serial Motor</label>
            <input
              type="text"
              name="SN_Motor"
              value={formData.SN_Motor}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
              placeholder="Ingrese serial del motor"
              required
            />
          </div>
        )}

        {formData.Tipo === "VFD" && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Serial VFD</label>
            <input
              type="text"
              name="SN_VFD"
              value={formData.SN_VFD}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
              placeholder="Ingrese serial del VFD"
              required
            />
          </div>
        )}

        {/* Razón */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Razón</label>
          <textarea
            name="Razon"
            value={formData.Razon}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-red-400 resize-none h-32"
            placeholder="Describe la razón detalladamente..."
            required
          ></textarea>
        </div>

        {/* Estación */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Estación</label>
          <select
            name="Estacion"
            value={formData.Estacion}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
            required
          >
            <option value="">Selecciona estación...</option>
            <option value="L1ST">Linea 1 System Test</option>
            <option value="L1MT">Linea 1 Motor Test</option>
            <option value="L1FI">Linea 1 Final Inspection</option>
            <option value="L2ST">Linea 2 System Test</option>
            <option value="L2MT">Linea 2 Motor Test</option>
            <option value="L2FI">Linea 2 Final Inspection</option>
            <option value="L3ST">Linea 3 System Test</option>
            <option value="L3MT">Linea 3 Motor Test</option>
            <option value="L3FI">Linea 3 Final Inspection</option>
            <option value="LSAST">Linea SA System Test</option>
            <option value="LSAMT">Linea SA Motor Test</option>
            <option value="LSAFI">Linea SA Final Inspection</option>


          </select>
        </div>
        {/* JOB */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">JOB</label>
          <textarea
            name="JOB"
            value={formData.JOB}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-red-400 resize-none h-14"
            placeholder="Escribe la JOB que le corresponde"
            required
          ></textarea>
        </div>
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Fecha</label>
          <input
            type="text"
            name="Fecha"
            value={formData.Fecha}
            readOnly
            className="w-full bg-gray-700 text-gray-300 border border-gray-600 rounded-xl p-2"
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-green-500 text-black font-semibold rounded-xl py-2 mt-4 hover:bg-green-700 transition-all"
        >
          Guardar Registro
        </button>
      </form>
    </div>

  )
}

export default RegistroRechazos