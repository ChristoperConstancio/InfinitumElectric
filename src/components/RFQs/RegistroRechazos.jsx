import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addRechazos, getJobs } from '../../customHooks/RFQ';
import AlertMessage from '../Alertas/AlertMessage';

function RegistroRechazos() {

  const navigate = useNavigate();

  const [alert, setAlert] = useState(null);
  const [jobsAbiertas, setJobsAbiertas] = useState([]);

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

  /* ================= FECHA ACTUAL ================= */
  useEffect(() => {
    const hoy = new Date();
    const fechaHoraMX = hoy.toLocaleDateString("en-US", {
      timeZone: "America/Mexico_City",
    });

    setFormData((prev) => ({ ...prev, Fecha: fechaHoraMX }));
  }, []);

  /* ================= CARGAR JOBS ABIERTAS ================= */
  useEffect(() => {
    const cargarJobs = async () => {
      try {
        const jobs = await getJobs();

        if (jobs && jobs.length > 0) {
          const abiertas = jobs.filter(job => job.Status === "Abierta");
          setJobsAbiertas(abiertas);
        }
      } catch (error) {
        console.error("Error cargando JOBS:", error);
      }
    };

    cargarJobs();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const auditor = localStorage.getItem('username');

    const nuevoResultado = {
      ...formData,
      Auditor: auditor,
    };

    const isOk = await addRechazos(nuevoResultado);

    if (isOk) {
      setAlert({ type: "success", message: "Motor procesado correctamente!" });
      setTimeout(() => navigate('/fallas'), 1500);
    } else {
      setAlert({ type: "error", message: "Fallo en la conexión a la base de datos" });
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-b from-gray-900 to-black text-white shadow-xl rounded-2xl p-6 mt-10 border border-red-400">
      <h2 className="text-2xl font-bold mb-6 text-red-400 text-center">
        Registro de Rechazos
      </h2>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Tipo</label>
          <select
            name="Tipo"
            value={formData.Tipo}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
            required
          >
            <option value="">Selecciona...</option>
            <option value="Sistema">Sistema</option>
            <option value="Motor">Motor</option>
            <option value="VFD">VFD</option>
          </select>
        </div>

        {/* Campos condicionales */}
        {formData.Tipo === "Sistema" && (
          <>
            <InputField label="Serial Motor" name="SN_Motor" value={formData.SN_Motor} onChange={handleChange} />
            <InputField label="Serial VFD" name="SN_VFD" value={formData.SN_VFD} onChange={handleChange} />
            <InputField label="Serial Catalog" name="SN_Catalog" value={formData.SN_Catalog} onChange={handleChange} />
          </>
        )}

        {formData.Tipo === "Motor" && (
          <InputField label="Serial Motor" name="SN_Motor" value={formData.SN_Motor} onChange={handleChange} />
        )}

        {formData.Tipo === "VFD" && (
          <InputField label="Serial VFD" name="SN_VFD" value={formData.SN_VFD} onChange={handleChange} />
        )}

        {/* Razón */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Razón</label>
          <textarea
            name="Razon"
            value={formData.Razon}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-red-400 resize-none h-32"
            required
          />
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
            <option value="LVFD">Linea VFD</option>
          </select>
        </div>

        {/* JOB */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">JOB</label>
          <select
            name="JOB"
            value={formData.JOB}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
            required
          >
            <option value="">Selecciona JOB...</option>
            {jobsAbiertas.map((job, index) => (
              <option key={job.id || index} value={job.JOB}>
                {job.JOB}
              </option>
            ))}
          </select>
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
  );
}

/* ================= COMPONENTE REUTILIZABLE ================= */
function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-300">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 focus:ring-2 focus:ring-red-400"
        required
      />
    </div>
  );
}

export default RegistroRechazos;