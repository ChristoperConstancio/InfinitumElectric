import React, { useState } from "react";
import add from "../../assets/add.png";
import { Link } from "react-router-dom";
import { fetchRechazos } from "../../customHooks/RFQ";

function Fallas() {
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     UTIL: FECHA MM/DD/YYYY
  ========================= */
  const formatDateUS = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
  return `${Number(month)}/${Number(day)}/${year}`;
  };

  const toggleCheckbox = (item) => {
    const { SN_Motor } = item;
    setSelectedRow((prev) => (prev === SN_Motor ? null : SN_Motor));
  };

  /* =========================
     BUSCAR POR FECHA
  ========================= */
  const handleBuscar = async () => {
    if (!selectedDate) return;

    setLoading(true);

    const fechaFormateada = formatDateUS(selectedDate); // MM/DD/YYYY

    const data = await fetchRechazos(fechaFormateada);
    setFilteredData(data);
    setSelectedRow(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center px-12 py-6 border-b border-gray-700">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">
            Rechazos de Línea
          </h1>
          <p className="text-gray-400">
            Buscar rechazos por fecha
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex justify-end items-center space-x-4 px-12 py-4">

        {/* Fecha */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
        />

        {/* Buscar */}
        <button
          onClick={handleBuscar}
          disabled={!selectedDate || loading}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold px-4 py-2 rounded-lg"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>

        {/* Nuevo */}
        <Link
          to={"/RegistroRechazos"}
          className="bg-green-500 hover:bg-green-600 transition-all rounded-lg px-4 py-2 flex items-center space-x-2 shadow-md"
        >
          <img src={add} alt="Agregar" className="h-4 w-4" />
          <span className="text-sm font-semibold">Nuevo</span>
        </Link>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-x-auto px-12 pb-8">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-yellow-500 text-black text-sm uppercase">
              <th className="py-3 px-4 w-12"></th>
              <th className="py-3 px-4 text-left">SN VFD</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Fecha</th>
              <th className="py-3 px-4 text-left">Razón</th>
              <th className="py-3 px-4 text-left">Estación</th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.SN_Motor}
                  className={`hover:bg-gray-700 transition-colors ${
                    selectedRow === item.SN_Motor ? "bg-gray-700" : ""
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="radio"
                      checked={selectedRow === item.SN_Motor}
                      onChange={() => toggleCheckbox(item)}
                      className="accent-yellow-500"
                    />
                  </td>
                  <td className="py-3 px-4">{item.SN_Motor}</td>
                  <td className="py-3 px-4">{item.Status}</td>
                  <td className="py-3 px-4">{item.Fecha}</td>
                  <td className="py-3 px-4">{item.Razon}</td>
                  <td className="py-3 px-4">{item.Estacion}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400 italic">
                  {loading
                    ? "Buscando registros..."
                    : "Selecciona una fecha y presiona Buscar"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Fallas;
