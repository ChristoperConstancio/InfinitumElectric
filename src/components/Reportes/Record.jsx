import { useEffect, useState } from "react";
import { getFPYPorWeek, getFPYGlobalPorWeek } from "../../customHooks/RFQ";

export default function TablaFPYPorDia() {
    const [week, setWeek] = useState(1);
    const [rows, setRows] = useState([]);
    const [global, setGlobal] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargar();
    }, [week]);

    const cargar = async () => {
        setLoading(true);
        setRows([]);
        setGlobal(null);

        try {
            const dataTabla = await getFPYPorWeek(Number(week));
            const dataGlobal = await getFPYGlobalPorWeek(Number(week));

            setRows(Array.isArray(dataTabla) ? dataTabla : []);
            setGlobal(dataGlobal ?? null);
        } catch (err) {
            console.error("Error cargando FPY:", err);
            setRows([]);
            setGlobal(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 rounded-xl shadow-xl space-y-6">

            {/* SELECT week */}
            <div className="flex items-center gap-4">
                <label className="text-sm text-gray-300 font-semibold">
                    Week:
                </label>

                <select
                    value={week}
                    onChange={e => setWeek(Number(e.target.value))}
                    className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600"
                >
                    {Array.from({ length: 53 }, (_, i) => i + 1).map(s => (
                        <option key={s} value={s}>
                            Week {s}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🔥 GLOBAL week MT / ST / FI */}
            {global && (
                <div className="grid grid-cols-3 gap-4 bg-gray-800 p-4 rounded-xl">
                    {["MT", "ST", "FI"].map(est => (
                        <div key={est} className="text-center">
                            <p className="text-sm text-gray-400">
                                {est} · FPY Global Week {week}
                            </p>

                            <p
                                className={`text-4xl font-bold
            ${global[est].fpy < 95
                                        ? "text-red-400"
                                        : "text-green-400"
                                    }`}
                            >
                                {global[est].fpy}%
                            </p>

                            <p className="text-xs text-gray-400">
                                Rejects: {global[est].rechazos}
                            </p>

                            {/* 🔥 FST SOLO GLOBAL ST */}
                            {est === "ST" && (
                                <p className="text-sm text-green-400 font-semibold mt-1">
                                    Final System Test: {global.ST.fst}% 
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}


            {/* TABLA */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg">
                    <thead>
                        <tr className="bg-gray-700 text-white text-sm uppercase">
                            <th className="px-4 py-3 text-left">Fecha</th>
                            <th className="px-4 py-3 text-center">MT</th>
                            <th className="px-4 py-3 text-center">ST</th>
                            <th className="px-4 py-3 text-center">FI</th>
                        </tr>
                    </thead>

                    <tbody className="text-white text-sm">

                        {/* ⏳ LOADING */}
                        {loading && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                    Cargando datos…
                                </td>
                            </tr>
                        )}

                        {/* 🚫 SIN DATOS */}
                        {!loading && rows.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                    No hay datos para la semana {week}
                                </td>
                            </tr>
                        )}

                        {/* ✅ DATOS */}
                        {rows.map(row => (
                            <tr key={row.fecha} className="even:bg-gray-700">
                                <td className="px-4 py-3 font-semibold">
                                    {row.fecha}
                                </td>

                                {["MT", "ST", "FI"].map(est => {
                                    const data = row[est];
                                    if (!data) {
                                        return (
                                            <td key={est} className="px-4 py-3 text-center text-gray-500">
                                                —
                                            </td>
                                        );
                                    }

                                    return (
                                        <td
                                            key={est}
                                            className={`px-4 py-3 text-center font-bold
                        ${data.fpy < 95
                                                    ? "text-red-400"
                                                    : "text-green-400"
                                                }`}
                                        >
                                            <div className="flex flex-col items-center leading-tight">
                                                <span>{data.fpy}%</span>
                                                <span className="text-xs text-gray-400">
                                                    ({data.rechazos}) Rejects
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
