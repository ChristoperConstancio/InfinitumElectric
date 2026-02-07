import { useState, useEffect } from "react";
import { addLiberados, createFPYDiario, existeEnAnalizados, getJobsActivas, sumarLiberadoAJOB } from "../../customHooks/RFQ";
import AlertMessage from "../Alertas/AlertMessage";

function FinalStation() {
  const [lineaSeleccionada, setLineaSeleccionada] = useState("");
  const [alert, setAlert] = useState(null);
  const [jobsActivas, setJobsActivas] = useState([]);
  const [tipoResultado, setTipoResultado] = useState("OK");
  // OK | RETRABAJO | RECHAZADO

  const [razon, setRazon] = useState("");
  const [form, setForm] = useState({
    SN_CATALOG: "",
    SN_MOTOR: "",
    SN_VFD: "",
    PLEX: "",
    JOB: jobsActivas,
  });

  
  // 🔄 Manejo de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 💾 Guardar liberación
  const handleGuardar = async (e) => {
    e.preventDefault();
    const now = new Date();
    const fechaHoraMX = now.toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
      hour12: false
    });



  try {
    // 🔍 buscar SN_MOTOR en analizados
    const recuperado = await existeEnAnalizados(form.SN_MOTOR);
    const payload = {
      ...form,
      linea: lineaSeleccionada,
      fecha: fechaHoraMX, // fecha + hora juntas
      recuperado: recuperado ? "Si" : "No",
    };
    const isOk = await addLiberados(payload);

    if (isOk) {
      setAlert({
        type: "success",
        message: "Motor liberado correctamente",
      });
      const okJob = await sumarLiberadoAJOB(form.JOB);
      if (!okJob) {
        setAlert({
          show: true,
          type: "warning",
          message: "Motor liberado, pero NO se pudo actualizar la JOB",
        });
        return;
      }
      setAlert({
        show: true,
        type: "success",
        message: "Motor liberado y JOB actualizada",
      });
      // Limpia form
      setForm((prev) => ({
        ...prev,
        SN_CATALOG: "",
        SN_MOTOR: "",
        SN_VFD: "",
        PLEX: "",
      }));
      return;
    }


    return true;
  } catch (error) {
    setAlert({
      type: "error",
      message: "Error de conexión, avise a supervisor",
    });
    console.log(error)
    return false;
  }


};
useEffect(() => {
  const cargarJobs = async () => {
    const data = await getJobsActivas();
    setJobsActivas(data);
  };

  cargarJobs();
}, []);
return (
  <div className="max-w-3xl mx-auto text-white mt-10 space-y-8">

    {alert && (
      <AlertMessage
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert(null)}
      />
    )}

    <form
      onSubmit={handleGuardar}
      className="max-w-lg mx-auto bg-gray-900 p-8 rounded-xl border border-red-400 shadow-xl space-y-4"
    >
      <h2 className="text-2xl font-bold text-green-400 text-center mb-6">
        Liberación Final
      </h2>

      {/* Línea */}
      <select
        required
        value={lineaSeleccionada}
        onChange={(e) => setLineaSeleccionada(e.target.value)}
        className="w-full p-2 rounded bg-gray-800"
      >
        <option value="">Selecciona línea</option>
        <option value="L1">Línea 1</option>
        <option value="L2">Línea 2</option>
        <option value="L3">Línea 3</option>
        <option value="LSA">Línea SA</option>
      </select>
      <select
        required
        name="JOB"
        value={form.JOB}
        onChange={handleChange}
        className="w-full p-2 rounded bg-gray-800"
      >
        <option value="">Selecciona JOB activa</option>

        {jobsActivas.map((job) => (
          <option key={job.id} value={job.id}>
            {job.id}
            
          </option>
        ))}
      </select>
      <input
        required
        name="SN_CATALOG"
        value={form.SN_CATALOG}
        onChange={handleChange}
        placeholder="SN Catalog"
        className="w-full p-2 rounded bg-gray-800"
      />

      <input
        required
        name="SN_MOTOR"
        value={form.SN_MOTOR}
        onChange={handleChange}
        placeholder="SN Motor"
        className="w-full p-2 rounded bg-gray-800"
      />

      <input
        required
        name="SN_VFD"
        value={form.SN_VFD}
        onChange={handleChange}
        placeholder="SN VFD"
        className="w-full p-2 rounded bg-gray-800"
      />

      <input
        required
        name="PLEX"
        value={form.PLEX}
        onChange={handleChange}
        placeholder="PLEX "
        className="w-full p-2 rounded bg-gray-800"
      />

      <button
        type="submit"
        className="w-full bg-green-500 text-black font-semibold py-2 rounded-lg hover:bg-green-400 transition"
      >
        Guardar
      </button>
    </form>
  </div>
);
}

export default FinalStation;
