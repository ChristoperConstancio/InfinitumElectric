import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cerrarJob, getJobs } from "../../customHooks/RFQ";
import AlertMessage from "../Alertas/AlertMessage";

function ListaJobs() {
  const [jobs, setJobs] = useState([]);
  const [alert, setAlert] = useState(null);
  const [filtro, setFiltro] = useState("Todas");
  const [jobSeleccionada, setJobSeleccionada] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    obtenerJobs();
  }, []);

  const obtenerJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Error al cargar JOBs",
      });
    }
  };

  const handleCerrarJob = async () => {
    if (!jobSeleccionada) return;

    try {
      await cerrarJob(jobSeleccionada);

      setAlert({
        type: "success",
        message: `JOB ${jobSeleccionada} cerrada correctamente`,
      });

      setJobSeleccionada(null);
      obtenerJobs();
    } catch (error) {
      setAlert({
        type: "error",
        message: "Error al cerrar la JOB",
      });
    }
  };

  const jobsFiltradas =
    filtro === "Todas"
      ? jobs
      : jobs.filter((job) => job.Status === filtro);

  return (
    <div className="max-w-6xl mx-auto mt-10 text-white space-y-6">

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Encabezado + Botón */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-400">
          Lista de JOBs
        </h2>

        <button
          onClick={() => navigate("/JOB")}
          className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-bold text-black transition"
        >
          + Agregar JOB
        </button>
      </div>

      {/* Filtro */}
      <div className="flex justify-center gap-4">
        {["Todas", "Abierta", "Cerrada"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filtro === tipo
                ? "bg-blue-500 text-black"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Botón cerrar */}
      {jobSeleccionada && (
        <div className="flex justify-center">
          <button
            onClick={handleCerrarJob}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-bold text-black"
          >
            Cerrar JOB {jobSeleccionada}
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-gray-700">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3">JOB</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Progreso</th>
              <th className="p-3">Avance</th>
              <th className="p-3">Status</th>
              <th className="p-3">Fecha Alta</th>
            </tr>
          </thead>
          <tbody>
            {jobsFiltradas.map((job) => {
              const porcentaje = job.Cantidad
                ? ((job.liberados || 0) / job.Cantidad) * 100
                : 0;

              return (
                <tr
                  key={job.id}
                  onClick={() => setJobSeleccionada(job.id)}
                  className={`border-t border-gray-700 hover:bg-gray-800 transition cursor-pointer ${
                    jobSeleccionada === job.id ? "bg-blue-900" : ""
                  }`}
                >
                  <td className="p-3 font-semibold">{job.id}</td>
                  <td className="p-3">{job.SKU}</td>
                  <td className="p-3">
                    {job.liberados || 0} / {job.Cantidad}
                  </td>

                  <td className="p-3">
                    <span
                      className={`font-bold ${
                        porcentaje >= 100
                          ? "text-green-400"
                          : porcentaje < 50
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {Math.floor(porcentaje)}%
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        job.Status === "Abierta"
                          ? "bg-green-500 text-black"
                          : "bg-red-500 text-black"
                      }`}
                    >
                      {job.Status}
                    </span>
                  </td>

                  <td className="p-3">{job.fechaAlta}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaJobs;
