import { useEffect, useState } from 'react'
import add from '../../assets/add.png'
import view from '../../assets/view.png'
import { Link, useNavigate } from 'react-router-dom';


import { fetchRechazos } from '../../customHooks/RFQ';

function Desenmsable() {
  const [filteredData, setFilteredData] = useState()
  const [selectedRow, setSelectedRow] = useState()
  const navigate = useNavigate();
  const [buttons, setButtonsState] = useState(false)

  const toggleCheckbox = (item) => {

    setSelectedRow(item.SN_Motor)
  }
  useEffect(() => {

    const getRechazos = async () => {
      const fallas = await fetchRechazos();
      setFilteredData(fallas)
    }
    const setButtons = () => {
      const tipoUsuario = localStorage.getItem('tipo');
      if (tipoUsuario == '1' || tipoUsuario == '2') {
        setButtonsState(true);
      }
    }
    setButtons();
    getRechazos();
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-12 py-6 border-b border-gray-700">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">Desensamble</h1>
          <p className="text-gray-400">Rechazos registrados</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 px-12 py-4">
        {buttons && (
          <>
            <Link
              to={"/BuscarRechazo"}
              className="bg-green-500 hover:bg-green-600 transition-all rounded-lg px-4 py-2 flex items-center space-x-2 shadow-md"
            >
              <img src={add} alt="Agregar" className="h-4 w-4" />
              <span className="text-sm font-semibold">Nuevo</span>
            </Link>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 transition-all rounded-lg px-4 py-2 flex items-center space-x-2 shadow-md"
            >
              <img src={view} alt="Ver" className="h-5 w-5" />
              <span className="text-sm font-semibold">Ver</span>
            </button>
          </>
        )}
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-x-auto px-12 pb-8">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-red-500 text-black text-sm uppercase">
              <th className="py-3 px-4 text-left w-12"></th>
              <th className="py-3 px-4 text-left">Tipo</th>
              <th className="py-3 px-4 text-left">SN Motor</th>
              <th className="py-3 px-4 text-left">Fecha</th>
              <th className="py-3 px-4 text-left">Razón</th>
              <th className="py-3 px-4 text-left">Disposicion</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.SN_Motor + item.Fecha} // clave única
                  className={`hover:bg-gray-700 transition-colors cursor-pointer ${selectedRow === item.SN_Motor ? "bg-gray-700" : ""
                    }`}
                  onClick={() => toggleCheckbox(item)} // 🔹 click en toda la fila
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="radio"
                      checked={selectedRow === item.SN_Motor}
                      readOnly
                      className="accent-yellow-500"
                    />
                  </td>
                  <td className="py-3 px-4">{item.Tipo}</td>
                  <td className="py-3 px-4">{item.SN_Motor}</td>
                  <td className="py-3 px-4">{item.Fecha}</td>
                  <td className="py-3 px-4">{item.Razon}</td>
                  <td className="py-3 px-4">{item.Disposicion}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-6 text-gray-400 italic">
                  No hay registros disponibles 
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

  )
}

export default Desenmsable