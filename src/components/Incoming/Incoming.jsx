import React, { useState, useEffect } from "react";
import {
    addInspectionComponent,
    addCharacteristic,
    subscribeToComponents,
    addInspectionResult
} from "../../customHooks/RFQ"; // ajusta la ruta según tu proyecto

const SAMPLING_OPTIONS = [
    { value: "1/1", label: "1 de 1 — 100% inspección" },
    { value: "1/5", label: "1 de 5 — cada 5 piezas" },
    { value: "1/10", label: "1 de 10 — cada 10 piezas" },
    { value: "1/25", label: "1 de 25 — cada 25 piezas" },
    { value: "5/lot", label: "5 por lote" },
    { value: "10/lot", label: "10 por lote" },
    { value: "AQL 1.0", label: "AQL 1.0 (Nivel II)" },
    { value: "AQL 2.5", label: "AQL 2.5 (Nivel II)" },
    { value: "custom", label: "Personalizado..." },
];

// ─── Componente principal ────────────────────────────────────────────
export default function Incoming() {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentComp, setCurrentComp] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newName, setNewName] = useState("");
    const [newPart, setNewPart] = useState("");

    // ── Listener en tiempo real ───────────────────────────────────────
    useEffect(() => {
        const unsub = subscribeToComponents((data) => {
            setComponents(data);
            setLoading(false);
            setCurrentComp((prev) =>
                prev ? (data.find((c) => c.id === prev.id) ?? prev) : null
            );
        });
        return () => unsub();
    }, []);



    if (currentComp) {
        return <Checksheet comp={currentComp} onBack={() => setCurrentComp(null)} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center px-12 py-6 border-b border-gray-700">
                <div>
                    <h1 className="text-3xl font-bold tracking-wide">Inspección de Material</h1>
                    <p className="text-gray-400">Selecciona un componente para iniciar la inspección</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-400 transition-all text-black font-semibold px-5 py-2 rounded-lg flex items-center gap-2 shadow-md"
                >
                    <span className="text-lg leading-none">+</span> Agregar componente
                </button>
            </div>

            {/* Tabla */}
            <div className="flex-1 overflow-x-auto px-12 pb-8 pt-6">
                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                    <thead>
                        <tr className="bg-yellow-500 text-black text-sm uppercase">
                            <th className="py-3 px-4 text-left">Componente</th>
                            <th className="py-3 px-4 text-left">No. de parte</th>
                            <th className="py-3 px-4 text-center">Características</th>
                            <th className="py-3 px-4 text-center">Estado</th>
                            <th className="py-3 px-4 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500 italic">
                                    Cargando componentes...
                                </td>
                            </tr>
                        ) : components.length > 0 ? (
                            components.map((comp) => (
                                <tr key={comp.id} className="hover:bg-gray-700 transition-colors">
                                    <td className="py-3 px-4 font-medium">{comp.name}</td>
                                    <td className="py-3 px-4 text-gray-400">{comp.part}</td>
                                    <td className="py-3 px-4 text-center">{comp.chars?.length ?? 0}</td>
                                    <td className="py-3 px-4 text-center">
                                        {comp.chars?.length > 0 ? (
                                            <span className="bg-green-900 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                                                Configurado
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-900 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
                                                Pendiente
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setCurrentComp(comp)}
                                            className="bg-yellow-500 hover:bg-yellow-400 transition-all text-black text-xs font-semibold px-4 py-1.5 rounded-lg"
                                        >
                                            Ver checksheet
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500 italic">
                                    No hay componentes. Agrega uno para comenzar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal agregar componente */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 w-80 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-white">Nuevo componente</h3>
                        <div className="flex flex-col gap-3 mb-5">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Nombre del componente</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ej. Bracket lateral A"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Número de parte</label>
                                <input
                                    type="text"
                                    value={newPart}
                                    onChange={(e) => setNewPart(e.target.value)}
                                    placeholder="Ej. PN-4821-C"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowAddModal(false); setNewName(""); setNewPart(""); }}
                                className="px-4 py-2 rounded-lg text-sm text-gray-300 border border-gray-600 hover:bg-gray-700 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddComponent}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-black transition-all"
                            >
                                {saving ? "Guardando..." : "Agregar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Checksheet de un componente ────────────────────────────────────
function Checksheet({ comp, onBack }) {
    const [pieceId, setPieceId] = useState("");
    const [measureValue, setMeasureValue] = useState("");
    const [savingMeasure, setSavingMeasure] = useState(false);
    const [serial, setSerial] = useState("");
    const [type, setType] = useState(null);
    const [target, setTarget] = useState("");
    const [tolPos, setTolPos] = useState("");
    const [tolNeg, setTolNeg] = useState("");
    const [sampling, setSampling] = useState("");
    const [customN, setCustomN] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);
    const [saving, setSaving] = useState(false);

    const chars = comp.chars ?? [];
    const attrs = chars.filter((c) => c.type === "atributo").length;
    const meas = chars.filter((c) => c.type === "medicion").length;

    const resetForm = () => {
        setSerial(""); setType(null); setTarget("");
        setTolPos(""); setTolNeg(""); setSampling(""); setCustomN("");
    };
    const handleSaveMeasurement = async () => {
        if (selectedRow == null) {
            alert("Selecciona una característica");
            return;
        }

        if (!pieceId.trim()) {
            alert("Ingresa ID de pieza");
            return;
        }

        const ch = chars[selectedRow];

        let status = "PASS";

        if (ch.type === "medicion") {
            const value = Number(measureValue);

            const max = ch.target + ch.tolPos;
            const min = ch.target - ch.tolNeg;

            status =
                value >= min && value <= max
                    ? "PASS"
                    : "FAIL";
        }

        const result = {
            pieceId: pieceId.trim(),
            charSerial: ch.serial,
            value:
                ch.type === "medicion"
                    ? Number(measureValue)
                    : null,
            status,
            createdAt: Date.now(),
        };

        setSavingMeasure(true);
        console.log(comp)
        const ok = await addInspectionResult(comp.id, result);

        if (ok) {
            setPieceId("");
            setMeasureValue("");
        }

        setSavingMeasure(false);
    };
    // ── Agregar componente ────────────────────────────────────────────
    const handleAddComponent = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        const id = await addInspectionComponent({
            name: newName.trim(),
            part: newPart.trim() || "—",
        });
        if (id) {
            setNewName("");
            setNewPart("");
            setShowAddModal(false);
        }
        setSaving(false);
    };
    // ── Guardar característica ────────────────────────────────────────
    const handleSave = async () => {
        if (!serial.trim()) { alert("Ingresa el número de serial."); return; }
        if (!type) { alert("Selecciona el tipo de inspección."); return; }
        if (!sampling) { alert("Selecciona un plan de muestreo."); return; }
        if (type === "medicion") {
            if (target === "" || isNaN(Number(target))) { alert("Ingresa el valor target."); return; }
            if (tolPos === "" || isNaN(Number(tolPos))) { alert("Ingresa la tolerancia positiva."); return; }
            if (tolNeg === "" || isNaN(Number(tolNeg))) { alert("Ingresa la tolerancia negativa."); return; }
        }

        const sampLabel = sampling === "custom" ? `${customN} piezas` : sampling;
        const newChar = type === "medicion"
            ? { serial: serial.trim(), type, target: Number(target), tolPos: Number(tolPos), tolNeg: Number(tolNeg), sampling: sampLabel }
            : { serial: serial.trim(), type, sampling: sampLabel };

        setSaving(true);
        const ok = await addCharacteristic(comp.id, newChar, chars);
        if (ok) resetForm();
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center px-12 py-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="border border-gray-600 hover:bg-gray-700 transition-all text-gray-300 text-sm px-4 py-2 rounded-lg"
                    >
                        ← Atrás
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-wide">{comp.name}</h1>
                        <p className="text-gray-400">{comp.part} — Checksheet de inspección</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 px-12 py-6">
                {[
                    { label: "Características", val: chars.length },
                    { label: "Mediciones", val: meas },
                    { label: "Atributos", val: attrs },
                ].map((s) => (
                    <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-center">
                        <div className="text-3xl font-bold text-yellow-400">{s.val}</div>
                        <div className="text-gray-400 text-sm mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-6 px-12 pb-8 flex-1">

                {/* Tabla de características */}
                <div className="flex-1 overflow-x-auto">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
                        Características registradas
                    </h2>
                    <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                        <thead>
                            <tr className="bg-yellow-500 text-black text-sm uppercase">
                                <th className="py-3 px-4 w-10"></th>
                                <th className="py-3 px-4 text-left">Serial</th>
                                <th className="py-3 px-4 text-left">Tipo</th>
                                <th className="py-3 px-4 text-left">Target</th>
                                <th className="py-3 px-4 text-left">Tolerancia</th>
                                <th className="py-3 px-4 text-left">Sampling</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {chars.length > 0 ? (
                                chars.map((ch, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => setSelectedRow((prev) => (prev === i ? null : i))}
                                        className={`hover:bg-gray-700 transition-colors cursor-pointer ${selectedRow === i ? "bg-gray-700" : ""
                                            }`}
                                    >
                                        <td className="py-3 px-4 text-center">
                                            <input type="radio" readOnly checked={selectedRow === i} className="accent-yellow-500" />
                                        </td>
                                        <td className="py-3 px-4 font-medium">{ch.serial}</td>
                                        <td className="py-3 px-4">
                                            {ch.type === "medicion" ? (
                                                <span className="bg-purple-900 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full">Medición</span>
                                            ) : (
                                                <span className="bg-blue-900 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">Atributo</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-300">{ch.type === "medicion" ? ch.target : "—"}</td>
                                        <td className="py-3 px-4 text-gray-300 text-sm">
                                            {ch.type === "medicion"
                                                ? <span><span className="text-green-400">+{ch.tolPos}</span> / <span className="text-red-400">−{ch.tolNeg}</span></span>
                                                : "—"}
                                        </td>
                                        <td className="py-3 px-4 text-gray-300">{ch.sampling}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500 italic">
                                        Sin características. Agrega la primera desde el formulario.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {selectedRow != null && (
                            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mt-4 flex flex-col gap-3">
                                <h3 className="font-semibold text-yellow-400">
                                    Registrar medición
                                </h3>

                                <input
                                    type="text"
                                    placeholder="ID pieza / lote"
                                    value={pieceId}
                                    onChange={(e) => setPieceId(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                                />

                                {chars[selectedRow].type === "medicion" && (
                                    <input
                                        type="number"
                                        step="0.001"
                                        placeholder="Valor medido"
                                        value={measureValue}
                                        onChange={(e) => setMeasureValue(e.target.value)}
                                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                                    />
                                )}

                                <button
                                    onClick={handleSaveMeasurement}
                                    disabled={savingMeasure}
                                    className="bg-green-500 hover:bg-green-400 text-black font-semibold py-2 rounded-lg"
                                >
                                    {savingMeasure
                                        ? "Guardando..."
                                        : "Guardar medición"}
                                </button>
                            </div>
                        )}
                    </table>
                </div>

                {/* Formulario nueva característica */}
                <div className="w-80 shrink-0">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">
                        Nueva característica
                    </h2>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col gap-4">

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Serial / Identificador</label>
                            <input
                                type="text"
                                value={serial}
                                onChange={(e) => setSerial(e.target.value)}
                                placeholder="Ej. DIM-001, ATTR-A"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Tipo de inspección</label>
                            <div className="grid grid-cols-2 gap-2">
                                {["atributo", "medicion"].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${type === t
                                            ? "bg-yellow-500 border-yellow-500 text-black"
                                            : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-400"
                                            }`}
                                    >
                                        {t === "atributo" ? "✓ Atributo" : "⊞ Medición"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {type === "medicion" && (
                            <>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Target (valor nominal)</label>
                                    <input
                                        type="number"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        placeholder="Ej. 25.000"
                                        step="0.001"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Tolerancia</label>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-green-400 font-bold text-sm">+</span>
                                        <input
                                            type="number"
                                            value={tolPos}
                                            onChange={(e) => setTolPos(e.target.value)}
                                            placeholder="0.05"
                                            step="0.001"
                                            min="0"
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
                                        />
                                        <span className="text-red-400 font-bold text-sm">−</span>
                                        <input
                                            type="number"
                                            value={tolNeg}
                                            onChange={(e) => setTolNeg(e.target.value)}
                                            placeholder="0.05"
                                            step="0.001"
                                            min="0"
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Plan de muestreo (Sampling)</label>
                            <select
                                value={sampling}
                                onChange={(e) => setSampling(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                            >
                                <option value="">Selecciona...</option>
                                {SAMPLING_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            {sampling === "custom" && (
                                <input
                                    type="number"
                                    value={customN}
                                    onChange={(e) => setCustomN(e.target.value)}
                                    placeholder="Número de piezas"
                                    min="1"
                                    className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                                />
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-black font-semibold py-2.5 rounded-lg text-sm transition-all mt-1"
                        >
                            {saving ? "Guardando en Firebase..." : "+ Agregar característica"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
