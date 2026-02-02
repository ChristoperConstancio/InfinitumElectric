import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react';
import { obtenerFolioUnico } from '../../customHooks/RFQ';
function CrearEnvio() {
    const [tipo, setTipo] = useState(""); // "VFD" | "Stator"

    const handleTipoChange = (e) => {
        setTipo(e.target.value);
    };

    const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const folio = await obtenerFolioUnico();

                const ahora = new Date().toISOString();

                const form = new FormData(e.target);
                const data = Object.fromEntries(form.entries());

                const payload = {
                    ...data,
                    Folio: folio,
                    FechaHora: ahora,
                };

                console.log("Guardando:", payload);

                // await addDoc(collection(db, "Final"), payload);

                alert(`✅ Guardado correctamente. Folio: ${folio}`);
                e.target.reset();
            } catch (error) {
                console.error(error);
                alert("❌ Error generando folio único");
            }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto bg-gray-900 text-white p-8 rounded-xl border border-red-500 shadow-xl space-y-5"
        >
            <h2 className="text-2xl font-bold text-red-400 text-center">
                Envio de material
            </h2>

            {/* Tipo */}
            <div>
                <label className="block text-sm mb-2 text-gray-300">
                    Tipo de producto *
                </label>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="Tipo"
                            value="VFD"
                            onChange={handleTipoChange}
                            required
                        />
                        VFD
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="Tipo"
                            value="Stator"
                            onChange={handleTipoChange}
                            required
                        />
                        Stator
                    </label>
                </div>
            </div>

            {/* Número de parte */}
            <div>
                <label className="block text-sm mb-1 text-gray-300">
                    Número de Parte *
                </label>
                <input
                    type="text"
                    name="NumeroParte"
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                />
            </div>

            {/* Versión (solo VFD) */}
            {tipo === "VFD" && (
                <div>
                    <label className="block text-sm mb-1 text-gray-300">
                        Versión *
                    </label>
                    <input
                        type="text"
                        name="Version"
                        required
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                    />
                </div>
            )}

            {/* Cantidad */}
            <div>
                <label className="block text-sm mb-1 text-gray-300">
                    Cantidad *
                </label>
                <input
                    type="number"
                    name="Cantidad"
                    min="1"
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                />
            </div>

            {/* JOB */}
            <div>
                <label className="block text-sm mb-1 text-gray-300">
                    JOB *
                </label>
                <input
                    type="text"
                    name="JOB"
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                />
            </div>

            {/* Auditor */}
            <div>
                <label className="block text-sm mb-1 text-gray-300">
                    Auditor *
                </label>
                <input
                    type="text"
                    name="Auditor"
                    required
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2"
                />
            </div>

            {/* Botón */}
            <button
                type="submit"
                className="w-full bg-green-500 text-black font-semibold py-2 rounded-lg hover:bg-green-400 transition"
            >
                Guardar
            </button>
        </form>
    )
}

export default CrearEnvio