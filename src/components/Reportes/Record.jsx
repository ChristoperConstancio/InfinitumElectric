import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";

/* ================= CONFIG ================= */

const lineas = ["L1", "L2", "L3", "LSA"];
const estaciones = ["MT", "ST", "FI"];

// DÍAS A MOSTRAR (ej. últimos 7 docs)
const DIAS = 7;

const getFechasMX = (dias) => {
    const fechas = [];
    const hoy = new Date();

    for (let i = 0; i < dias; i++) {
        const d = new Date(hoy);
        d.setDate(hoy.getDate() - i);
        fechas.push(
            d.toLocaleDateString("es-MX", {
                timeZone: "America/Mexico_City"
            }).replaceAll("/", "-")
        );
    }

    return fechas; // 🔴 NO reverse, NO semana
};

const calcularFPY = (liberados, rechazados) => {
    const total = liberados + rechazados;
    if (total === 0) return 100;
    return +(liberados / total * 100).toFixed(1);
};

/* ================= COMPONENTE ================= */

export default function TablaFPYPorDia() {
    const db = getFirestore();
    const [rows, setRows] = useState([]);

    useEffect(() => {
        cargarFPYDiario();
    }, []);

    const cargarFPYDiario = async () => {
        const fechas = getFechasMX(DIAS);
        const resultado = [];

        for (const fecha of fechas) {
            const ref = doc(db, "FPY", fecha);
            const snap = await getDoc(ref);

            if (!snap.exists()) continue; // solo días existentes

            const fpy = snap.data();

            let liberados = 0;
            let rechazados = { MT: 0, ST: 0, FI: 0 };

            lineas.forEach(l => {
                liberados += fpy[`Liberados${l}`] || 0;
                rechazados.MT += fpy[`Rechazados${l}MT`] || 0;
                rechazados.ST += fpy[`Rechazados${l}ST`] || 0;
                rechazados.FI += fpy[`Rechazados${l}FI`] || 0;
            });

            resultado.push({
                fecha,
                MT: calcularFPY(liberados, rechazados.MT),
                ST: calcularFPY(liberados, rechazados.ST),
                FI: calcularFPY(liberados, rechazados.FI),
            });
        }

        setRows(resultado);
    };

    /* ================= RENDER ================= */

    return (
        <div className="p-6 bg-gray-900 rounded-xl shadow-xl space-y-6">

            <h1 className="text-3xl font-bold text-white">
                FPY Diario (% por día)
            </h1>

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
                        {rows.map(r => (
                            <tr key={r.fecha} className="even:bg-gray-700">
                                <td className="px-4 py-3 font-semibold">
                                    {r.fecha}
                                </td>

                                {estaciones.map(e => (
                                    <td
                                        key={e}
                                        className={`px-4 py-3 text-center font-bold
                                            ${r[e] < 95
                                                ? "text-red-400"
                                                : "text-green-400"
                                            }`}
                                    >
                                        {r[e]}%
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-gray-400">
                Cada fila corresponde a un documento FPY/{`{fecha}`} · No semanal
            </p>
        </div>
    );
}