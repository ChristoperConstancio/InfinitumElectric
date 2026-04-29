import { useEffect, useState } from 'react'
import add from '../../assets/add.png'
import view from '../../assets/view.png'
import { Link, useNavigate } from 'react-router-dom'
import { getRecibos } from '../../customHooks/RFQ'

function Recibo() {
    const navigate = useNavigate()

    const [filteredData, setFilteredData] = useState([])
    const [selectedRow, setSelectedRow] = useState()
    const [buttons, setButtonsState] = useState(false)
    const [loading, setLoading] = useState(false)

    const [filters, setFilters] = useState({
        Month: '',
        partNo: '',
        pl: '',
        po: '',
        status: '',
        tipoMaterial: '',
        serialPlex: '',
        invoice: ''
    })

    const toggleCheckbox = (item) => {
        setSelectedRow(item.id)
    }

    const handleDoubleClick = (item) => {
        navigate(`/EditarRecibo/${item.id}`)
    }

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        })
    }

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

        if (filters.status) {
            result = result.filter(item =>
                item.status?.toLowerCase() === filters.status.toLowerCase()
            )
        }

        if (filters.tipoMaterial) {
            result = result.filter(item =>
                item.tipoMaterial?.toLowerCase() === filters.tipoMaterial.toLowerCase()
            )
        }

        if (filters.serialPlex) {
            result = result.filter(item =>
                item.serialPlex?.toLowerCase().includes(filters.serialPlex.toLowerCase())
            )
        }

        if (filters.invoice) {
            result = result.filter(item =>
                item.invoice?.toLowerCase().includes(filters.invoice.toLowerCase())
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

    const handleClearFilters = () => {
        setFilters({
            Month: '',
            partNo: '',
            pl: '',
            po: '',
            status: '',
            tipoMaterial: '',
            serialPlex: '',
            invoice: ''
        })
        setFilteredData([])
    }

    useEffect(() => {
        const tipoUsuario = localStorage.getItem('tipo')
        if (tipoUsuario == '1' || tipoUsuario == '6') {
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

            {/* Hint UX */}
            <div className="px-12 text-gray-400 text-sm pt-2">
                Doble click en un registro para editar
            </div>

            {/* Filtros — fila 1 */}
            <div className="px-12 pt-4 grid grid-cols-5 gap-4">
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

                <input
                    type="text"
                    name="serialPlex"
                    placeholder="Serial Plex"
                    value={filters.serialPlex}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                />
            </div>

            {/* Filtros — fila 2 */}
            <div className="px-12 py-4 grid grid-cols-5 gap-4">
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                >
                    <option value="">Todos los status</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="completado">Completado</option>
                </select>

                <select
                    name="tipoMaterial"
                    value={filters.tipoMaterial}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                >
                    <option value="">Todos los tipos</option>
                    <option value="materia_prima">Materia Prima</option>
                    <option value="producto_terminado">Producto Terminado</option>
                    <option value="consumible">Consumible</option>
                    <option value="herramienta">Herramienta</option>
                </select>

                <input
                    type="text"
                    name="invoice"
                    placeholder="Factura / Invoice"
                    value={filters.invoice}
                    onChange={handleChange}
                    className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
                />

                <button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 font-semibold shadow-md"
                >
                    Buscar
                </button>

                <button
                    onClick={handleClearFilters}
                    className="bg-gray-600 hover:bg-gray-500 rounded-lg px-4 py-2 font-semibold shadow-md"
                >
                    Limpiar
                </button>
            </div>

            {/* Botones acción */}
            <div className="flex justify-end space-x-4 px-12 py-2">
                {buttons && (
                    <>
                        <Link
                            to={"/AgregarRecibo"}
                            className="bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2 flex items-center space-x-2 shadow-md"
                        >
                            <img src={add} alt="Agregar" className="h-4 w-4" />
                            <span className="text-sm font-semibold">Nuevo</span>
                        </Link>

                        <button
                            disabled={!selectedRow}
                            onClick={() => navigate(`/EditarRecibo/${selectedRow}`)}
                            className={`rounded-lg px-4 py-2 flex items-center space-x-2 shadow-md 
                                ${selectedRow
                                    ? 'bg-yellow-500 hover:bg-yellow-600'
                                    : 'bg-gray-600 cursor-not-allowed'}`}
                        >
                            <img src={view} alt="Editar" className="h-5 w-5" />
                            <span className="text-sm font-semibold">Editar</span>
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
                            <th className="p-3 text-left w-1/12">Fecha</th>
                            <th className="p-3 text-left w-1/12">Part No</th>
                            <th className="p-3 text-left w-1/12">PL</th>
                            <th className="p-3 text-left w-1/12">PO</th>
                            <th className="p-3 text-left w-1/12">Serial Plex</th>
                            <th className="p-3 text-left w-1/12">Factura</th>
                            <th className="p-3 text-left w-1/12">Status</th>
                            <th className="p-3 text-center w-1/12">Qty</th>
                            <th className="p-3 text-center w-1/12">Inspección</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.map((item, index) => {
                            const arribos = item.arribos || 0
                            const inspeccion = arribos % 5 === 1

                            const statusColors = {
                                pendiente: 'text-yellow-400',
                                aprobado: 'text-green-400',
                                rechazado: 'text-red-400',
                                completado: 'text-blue-400',
                            }

                            const tipoLabels = {
                                materia_prima: 'Materia Prima',
                                producto_terminado: 'Prod. Terminado',
                                consumible: 'Consumible',
                                herramienta: 'Herramienta',
                            }

                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => toggleCheckbox(item)}
                                    onDoubleClick={() => handleDoubleClick(item)}
                                    className={`
                                        border-b border-gray-700
                                        ${selectedRow === item.id
                                            ? 'bg-blue-800'
                                            : index % 2 === 0
                                                ? 'bg-gray-800'
                                                : 'bg-gray-900'}
                                        hover:bg-gray-700 cursor-pointer
                                    `}
                                >
                                    <td className="p-3 text-left truncate">{item.createdAt}</td>
                                    <td className="p-3 text-left truncate">{item.partNo}</td>
                                    <td className="p-3 text-left truncate">{item.packingList}</td>
                                    <td className="p-3 text-left truncate">{item.po}</td>
                                    <td className="p-3 text-left truncate">{item.serialPlex}</td>
                                    <td className="p-3 text-left truncate">{item.invoice}</td>

                                    <td className={`p-3 text-left truncate font-semibold capitalize ${statusColors[item.status] ?? 'text-gray-300'}`}>
                                        {item.status}
                                    </td>
                                    <td className="p-3 text-center">{item.qty}</td>
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

                        {!loading && filteredData.length === 0 && (
                            <tr>
                                <td colSpan={11} className="p-6 text-center text-gray-500">
                                    No hay registros. Aplica filtros y presiona Buscar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-12 pb-6 text-gray-400 text-sm">
                Total registros: {filteredData.length}
            </div>

        </div>
    )
}

export default Recibo
