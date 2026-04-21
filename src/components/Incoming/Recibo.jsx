import { useEffect, useState } from 'react'
import add from '../../assets/add.png'
import view from '../../assets/view.png'
import { Link } from 'react-router-dom'
import { getRecibos } from '../../customHooks/RFQ'

function Recibo() {
    const [filteredData, setFilteredData] = useState([])
    const [selectedRow, setSelectedRow] = useState()
    const [buttons, setButtonsState] = useState(false)
    const [loading, setLoading] = useState(false)

    const [filters, setFilters] = useState({
        Month: '',
        partNo: '',
        pl: '',
        po: ''
    })

    const toggleCheckbox = (item) => {
        setSelectedRow(item.id)
    }

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        })
    }

    // 🔥 FILTROS FRONT
    const applyFilters = (data) => {
        let result = [...data]

        if (filters.Month) {
            result = result.filter(item => item.Month === filters.Month)
        }

        if (filters.partNo) {
            result = result.filter(item =>
                item.partNo?.toLowerCase().includes(filters.partNo.toLowerCase())
            )
        }

        if (filters.pl) {
            result = result.filter(item =>
                item.packingList?.toLowerCase().includes(filters.pl.toLowerCase())
            )
        }

        if (filters.po) {
            result = result.filter(item =>
                item.po?.toLowerCase().includes(filters.po.toLowerCase())
            )
        }

        return result
    }

    const handleSearch = async () => {
        setLoading(true)

        const data = await getRecibos(filters)
        const filtered = applyFilters(data)

        setFilteredData(filtered)
        setLoading(false)
    }

    useEffect(() => {
        const tipoUsuario = localStorage.getItem('tipo')
        if (tipoUsuario == '1' || tipoUsuario == '2') {
            setButtonsState(true)
        }
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center px-12 py-6 border-b border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold tracking-wide">Recibo</h1>
                    <p className="text-gray-400">Warehouse</p>
                </div>
            </div>

            {/* 🔹 Filtros */}
            <div className="px-12 py-4 grid grid-cols-5 gap-4">
                <select
                    name="Month"
                    value={filters.Month}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                >
                    <option value="">Todos los meses</option>
                    <option value="Enero-2026">Enero-2026</option>
                    <option value="Febrero-2026">Febrero-2026</option>
                    <option value="Marzo-2026">Marzo-2026</option>
                    <option value="Abril-2026">Abril-2026</option>
                    <option value="Mayo-2026">Mayo-2026</option>
                    <option value="Junio-2026">Junio-2026</option>
                    <option value="Julio-2026">Julio-2026</option>
                    <option value="Agosto-2026">Agosto-2026</option>
                    <option value="Septiembre-2026">Septiembre-2026</option>
                    <option value="Octubre-2026">Octubre-2026</option>
                    <option value="Noviembre-2026">Noviembre-2026</option>
                    <option value="Diciembre-2026">Diciembre-2026</option>
                </select>

                <input
                    type="text"
                    name="partNo"
                    placeholder="Part No"
                    value={filters.partNo}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                />

                <input
                    type="text"
                    name="pl"
                    placeholder="PL"
                    value={filters.pl}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                />

                <input
                    type="text"
                    name="po"
                    placeholder="PO"
                    value={filters.po}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                />

                <button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 font-semibold shadow-md"
                >
                    Buscar
                </button>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 px-12 py-4">
                {buttons && (
                    <>
                        <Link
                            to={"/AgregarRecibo"}
                            className="bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2 flex items-center space-x-2 shadow-md"
                        >
                            <img src={add} alt="Agregar" className="h-4 w-4" />
                            <span className="text-sm font-semibold">Nuevo</span>
                        </Link>

                        <button className="bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2 flex items-center space-x-2 shadow-md">
                            <img src={view} alt="Ver" className="h-5 w-5" />
                            <span className="text-sm font-semibold">Ver</span>
                        </button>
                    </>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="px-12 text-yellow-400">
                    Cargando datos...
                </div>
            )}

            {/* Tabla */}
            <div className="flex-1 overflow-x-auto px-12 pb-8">
                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr className="bg-blue-500 text-black text-sm uppercase">
                            <th className="p-3 text-left w-1/6">Fecha</th>
                            <th className="p-3 text-left w-1/6">Part No</th>
                            <th className="p-3 text-left w-1/6">PL</th>
                            <th className="p-3 text-left w-1/6">PO</th>
                            <th className="p-3 text-center w-1/12">Qty</th>
                            <th className="p-3 text-center w-1/12">Arribos</th>
                            <th className="p-3 text-center w-1/12">Inspección</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.map((item, index) => {
                            const arribos = item.arribos || 0
                            const inspeccion = arribos % 5 === 1

                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => toggleCheckbox(item)}
                                    className={`
                        border-b border-gray-700
                        ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
                        hover:bg-gray-700 cursor-pointer
                    `}
                                >
                                    <td className="p-3 text-left truncate">{item.createdAt}</td>
                                    <td className="p-3 text-left truncate">{item.partNo}</td>
                                    <td className="p-3 text-left truncate">{item.packingList}</td>
                                    <td className="p-3 text-left truncate">{item.po}</td>

                                    <td className="p-3 text-center">{item.qty}</td>
                                    <td className="p-3 text-center">{arribos}</td>

                                    <td className="p-3 text-center">
                                        {inspeccion ? (
                                            <span className="text-green-400 font-bold">●</span>
                                        ) : (
                                            <span className="text-red-500 font-bold">X</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="px-12 pb-6">
                Total registros: {filteredData.length}
            </div>

        </div>
    )
}

export default Recibo