import React, { useEffect, useState } from 'react'
import add from '../../assets/add.png'
import { Link } from 'react-router-dom'
import { fetchRechazos, inactivarRechazos } from '../../customHooks/RFQ'
import { useNavigate } from 'react-router-dom'
function RFQ() {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState()
  const [selectedRow, setSelectedRow] = useState()
  const toggleCheckbox = (id) => {
    const { SN_Motor } = id
    if (selectedRow === SN_Motor) {
      setSelectedRow(null); // Desmarca la fila si ya está seleccionada
    } else {
      setSelectedRow(SN_Motor); // Marca la nueva fila
    }
  };

  useEffect(() => {
    const getFallas = async () => {
      const data = await fetchRechazos();
      const hoy = new Date();
      const fechaFormateada = hoy.toLocaleDateString("en-US");
      console.log(fechaFormateada)
      const filterData = data.filter(item =>
        item.Status == "Rechazado" &&
        item.Fecha === "2/5/2026"
      ); 
      console.log(filterData)
      setFilteredData(filterData);

    }

    getFallas();
  }, [])

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-12 py-6 border-b border-gray-700">
          <div>
            <h1 className="text-3xl font-bold tracking-wide">Rechazos de Línea</h1>
            <p className="text-gray-400">Rechazos registrados</p>
          </div>


        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 px-12 py-4">

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
                <th className="py-3 px-4 text-left w-12"></th>
                <th className="py-3 px-4 text-left">SN Motor</th>
                <th className="py-3 px-4 text-left">Fecha</th>
                <th className="py-3 px-4 text-left">Razon </th>
                <th className="py-3 px-4 text-left">Estacion</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.SN_Motor}
                    className={`hover:bg-gray-700 transition-colors ${selectedRow === item.SN_Motor ? "bg-gray-700" : ""
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
                    <td className="py-3 px-4">{item.SN_Motor?.toString()}</td>
                    <td className="py-3 px-4">{item.Fecha?.toString()}</td>
                    <td className="py-3 px-4">{item.Razon?.toString()}</td>
                    <td className="py-3 px-4">{item.Estacion?.toString()}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-400 italic"
                  >
                    No hay registros disponibles 
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default RFQ