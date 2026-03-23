import { useEffect, useState } from "react";
import {
    getFPYPorWeek,
    getFPYGlobalPorWeek,
    getFPYGlobalPorMonth,
    getFPYGlobalPorYear // 👈 NUEVO
} from "../../customHooks/RFQ";

export default function TablaFPYPorDia() {
    const currentYear = new Date().getFullYear();

    const [week, setWeek] = useState(1);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(currentYear);

    const [rows, setRows] = useState([]);
    const [global, setGlobal] = useState(null);
    const [globalMonth, setGlobalMonth] = useState(null);
    const [globalYear, setGlobalYear] = useState(null); // 👈 NUEVO

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cargar();
    }, [week, month, year]);

    const cargar = async () => {
        setLoading(true);
        setRows([]);
        setGlobal(null);
        setGlobalMonth(null);
        setGlobalYear(null);

        try {
            const dataTabla = await getFPYPorWeek(
                Number(week),
                Number(year)
            );

            const dataGlobal = await getFPYGlobalPorWeek(
                Number(week),
                Number(year)
            );

            const dataGlobalMonth = await getFPYGlobalPorMonth(
                Number(month),
                Number(year)
            );

            const dataGlobalYear = await getFPYGlobalPorYear(
                Number(year)
            );

            setRows(Array.isArray(dataTabla) ? dataTabla : []);
            setGlobal(dataGlobal ?? null);
            setGlobalMonth(dataGlobalMonth ?? null);
            setGlobalYear(dataGlobalYear ?? null);

        } catch (err) {
            console.error("Error cargando FPY:", err);
            setRows([]);
            setGlobal(null);
            setGlobalMonth(null);
            setGlobalYear(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-900 rounded-xl shadow-xl space-y-6">

            {/* SELECTS */}
            <div className="flex items-center gap-6 flex-wrap">

                {/* YEAR */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-300 font-semibold">
                        Year:
                    </label>

                    <select
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                        className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600"
                    >
                        {[2024, 2025, 2026, 2027, 2028, 2029].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* MONTH */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-300 font-semibold">
                        Month:
                    </label>

                    <select
                        value={month}
                        onChange={e => setMonth(Number(e.target.value))}
                        className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>
                                Month {m}
                            </option>
                        ))}
                    </select>
                </div>

                {/* WEEK */}
                <div className="flex items-center gap-2">
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
            </div>

            {/* 🔥 GLOBAL WEEK */}
            {global && (
                <div className="grid grid-cols-3 gap-4 bg-gray-800 p-4 rounded-xl">
                    {["MT", "ST", "FI"].map(est => (
                        <div key={est} className="text-center">
                            <p className="text-sm text-gray-400">
                                {est} · FPY Global Week {week} ({year})
                            </p>

                            <p className={`text-4xl font-bold
                                ${global[est].fpy < 95 ? "text-red-400" : "text-green-400"}`}>
                                {global[est].fpy}%
                            </p>

                            <p className="text-xs text-gray-400">
                                Rejects: {global[est].rechazos}
                            </p>

                            {est === "ST" && (
                                <p className="text-sm text-green-400 font-semibold mt-1">
                                    Final System Test: {global.ST.fst}% / {global.ST.recuperados}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 🔥 GLOBAL MONTH */}
            {globalMonth && (
                <div className="grid grid-cols-3 gap-4 bg-gray-800 p-4 rounded-xl border border-yellow-500">
                    {["MT", "ST", "FI"].map(est => (
                        <div key={est} className="text-center">
                            <p className="text-sm text-gray-400">
                                {est} · FPY Global Month {month} ({year})
                            </p>

                            <p className={`text-4xl font-bold
                                ${globalMonth[est].fpy < 95 ? "text-red-400" : "text-green-400"}`}>
                                {globalMonth[est].fpy}%
                            </p>

                            <p className="text-xs text-gray-400">
                                Rejects: {globalMonth[est].rechazos}
                            </p>

                            {est === "ST" && (
                                <p className="text-sm text-green-400 font-semibold mt-1">
                                    Final System Test: {globalMonth.ST.fst}% / {globalMonth.ST.recuperados}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 🔥 GLOBAL YEAR 👇 NUEVO */}
            {globalYear && (
                <div className="grid grid-cols-3 gap-4 bg-gray-800 p-4 rounded-xl border border-blue-500">
                    {["MT", "ST", "FI"].map(est => (
                        <div key={est} className="text-center">
                            <p className="text-sm text-gray-400">
                                {est} · FPY Global Year {year}
                            </p>

                            <p className={`text-4xl font-bold
                                ${globalYear[est].fpy < 95 ? "text-red-400" : "text-green-400"}`}>
                                {globalYear[est].fpy}%
                            </p>

                            <p className="text-xs text-gray-400">
                                Rejects: {globalYear[est].rechazos}
                            </p>

                            {est === "ST" && (
                                <p className="text-sm text-green-400 font-semibold mt-1">
                                    Final System Test: {globalYear.ST.fst}% / {globalYear.ST.recuperados}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* TABLA (igual que la tenías) */}
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
                        {loading && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                    Cargando datos…
                                </td>
                            </tr>
                        )}

                        {!loading && rows.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                    No hay datos para la semana {week} ({year})
                                </td>
                            </tr>
                        )}

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
                                            ${data.fpy < 95 ? "text-red-400" : "text-green-400"}`}
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