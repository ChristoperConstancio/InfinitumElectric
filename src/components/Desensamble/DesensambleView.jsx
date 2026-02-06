import React, { useState } from "react";
import { addAnalizados, fetchRechId } from "../../customHooks/RFQ";
import { Form, useNavigate } from "react-router-dom";
import AlertMessage from "../Alertas/AlertMessage";
import { updateRechazo } from "../../customHooks/RFQ";
import { data } from "autoprefixer";
function BuscarRechazo() {
    const [snMotor, setSnMotor] = useState("");
    const [resultado, setResultado] = useState(null);
    const [alert, setAlert] = useState({ show: false, type: "", message: "" });
    const navigate = useNavigate();

    const mostrarSerial = (nivel, tipo) => {
        if (nivel === "Nivel 1") return ["MainBoard", "CIM"];
        if (nivel === "Nivel 2") return ["MainBoard", "CIM", "Rotor", "Stator"];
        if (nivel === "Nivel 3") return ["MainBoard", "CIM", "Rotor", "Stator"];
        return [];
    };
    const handleBuscar = async (e) => {
        e.preventDefault();
        const res = await fetchRechId(snMotor);
        if (!res) setAlert({ show: true, type: "error", message: "❌ Serial no encontrado; Revisa el serial." });

        setResultado(res)


    }
    const handleAgregar = async (e) => {
        e.preventDefault();
        const hoy = new Date();
        const fechaFormateada = hoy.toLocaleDateString("en-US"); // MM/DD/YYYY
        const auditor = localStorage.getItem('username')
        const nuevoResultado = {
            ...resultado,
            Analista: auditor,
            Status: "Analizado",       // agregas o sobrescribes
            FechaAnalisis: fechaFormateada, // puedes agregar un campo nuevo
        };
        const dataUpdate = {
            ...resultado,
            Status: "Analizado",
        }
        const isOk = await addAnalizados(nuevoResultado);
        await updateRechazo(dataUpdate)

        if (isOk) {
            setAlert({ show: true, type: "success", message: "Motor procesado!" });
            setResultado();
            return;
        }

        setAlert({ show: true, type: "error", message: "❌ Serial no encontrado; Revisa el serial." });



    }
    return (

        <div className="max-w-4xl mx-auto bg-gradient-to-b from-gray-950 to-gray-900 text-white shadow-2xl rounded-2xl p-10 mt-10 border border-red-500">
            <h2 className="text-3xl font-bold mb-10 text-red-400 text-center">
                Buscar Rechazo por SN Motor
            </h2>

            {/* Input de búsqueda */}
            <form onSubmit={handleBuscar} className="mb-10 flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                        SN Motor
                    </label>
                    <input
                        type="text"
                        value={snMotor}
                        onChange={(e) => setSnMotor(e.target.value)}
                        placeholder="Ingresa SN Motor..."
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-red-400 focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-red-500 text-black font-semibold rounded-lg px-8 py-3 hover:bg-red-400 transition-all w-full sm:w-auto"
                >
                    Buscar
                </button>
            </form>

            {alert && (
                <AlertMessage
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}

                />
            )}

            {/* Resultado */}
            {resultado && (
                <form onSubmit={handleAgregar}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Columna izquierda */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Tipo</label>
                                <input
                                    type="text"
                                    value={resultado.Tipo}
                                    readOnly
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">SN Motor</label>
                                <input
                                    type="text"
                                    value={resultado.SN_Motor}
                                    readOnly
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                                />
                            </div>

                            {(resultado.Tipo === "Sistema" || resultado.Tipo === "VFD") && (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">SN VFD</label>
                                    <input
                                        type="text"
                                        value={resultado.SN_VFD}
                                        readOnly
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                                    />
                                </div>
                            )}

                            {resultado.Tipo === "Sistema" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-300">SN Catalog</label>
                                        <input
                                            type="text"
                                            value={resultado.SN_Catalog}
                                            readOnly
                                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                                        />
                                    </div>

                                    {/* Select Disposición VFD */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-300">
                                            Disposición VFD
                                        </label>
                                        <select
                                            value={resultado.DisposicionVFD || ""}
                                            onChange={(e) =>
                                                setResultado((prev) => ({
                                                    ...prev,
                                                    DisposicionVFD: e.target.value,
                                                }))
                                            }
                                            className="w-full bg-gray-200 text-black border border-gray-600 rounded-xl p-2"
                                            required
                                        >
                                            <option value="">Seleccione una opción</option>
                                            <option value="Analisis">Analisis</option>
                                            <option value="Produccion">Produccion</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Select Nivel */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Nivel de desensamble</label>
                                <select
                                    value={resultado.Nivel || ""}
                                    onChange={(e) => setResultado({ ...resultado, Nivel: e.target.value })}
                                    className="w-full bg-gray-200 text-black border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                    required
                                >
                                    <option value="">Seleccionar nivel</option>

                                    {/* 🔹 Si es Motor o VFD → mostrar solo Nivel 2 y 3 */}
                                    {(resultado.Tipo === "Motor" || resultado.Tipo === "VFD") ? (
                                        <>
                                            <option value="Nivel 2">Nivel 2</option>
                                            <option value="Nivel 3">Nivel 3</option>
                                        </>
                                    ) : (
                                        /* 🔹 Si es Sistema u otro → mostrar los tres niveles */
                                        <>
                                            <option value="Nivel 1">Nivel 1</option>
                                            <option value="Nivel 2">Nivel 2</option>
                                            <option value="Nivel 3">Nivel 3</option>
                                        </>
                                    )}
                                </select>
                                {mostrarSerial(resultado.Nivel, resultado.Tipo).map((item) => (
                                    <div key={item}>
                                        <label className="block text-sm font-medium mb-1 text-gray-300">
                                            SN {item}
                                        </label>
                                        <input
                                            type="text"
                                            value={resultado[`SN_${item}`] || ""}
                                            onChange={(e) =>
                                                setResultado({
                                                    ...resultado,
                                                    [`SN_${item}`]: e.target.value,
                                                })
                                            }
                                            placeholder={`Ingrese SN ${item}`}
                                            className="w-full bg-gray-200 text-black border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Columna derecha */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Fecha</label>
                                <input
                                    type="text"
                                    value={resultado.Fecha}
                                    readOnly
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Auditor</label>
                                <input
                                    type="text"
                                    value={resultado.Auditor}
                                    readOnly
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Razón</label>
                                <textarea
                                    value={resultado.Razon}
                                    readOnly
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 h-32 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Comentarios</label>
                                <textarea
                                    value={resultado.Comentarios || ""}
                                    onChange={(e) => setResultado({ ...resultado, Comentarios: e.target.value })}
                                    placeholder="Agrega tus comentarios..."
                                    className="w-full bg-gray-200 placeholder-black text-black border border-gray-600 rounded-lg p-2 h-32 resize-none focus:ring-2 focus:ring-red-400 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
                                <input
                                    type="text"
                                    value={resultado.Status}
                                    readOnly
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-green-500 text-black font-semibold rounded-lg px-8 py-3 hover:bg-green-400 transition-all w-full sm:w-auto mt-6"
                    >
                        Aceptar
                    </button>
                </form>
            )}
        </div>


    );
}

export default BuscarRechazo;
