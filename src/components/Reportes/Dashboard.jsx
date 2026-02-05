import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import live from "../../assets/live.gif"
/* ================= CONFIG ================= */

const lineas = ["L1", "L2", "L3", "LSA"];

const estaciones = {
    MT: "Motor Test",
    ST: "System Test",
    FI: "Final Inspection"
};

const getFechaMX = () => {
    return new Date()
        .toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })
        .replaceAll("/", "-");
};

const calcularFPY = (liberados, rechazados) => {
    const total = liberados + rechazados;
    if (total === 0) return 100;
    return +(liberados / total * 100).toFixed(1);
};

/* ================= COMPONENTE ================= */

export default function TablaFPY() {
    const db = getFirestore();

    const [data, setData] = useState({
        Liberados: {},
        MT: {},
        ST: {},
        FI: {},
        Total: {}
    });

    useEffect(() => {
        cargarFPY();

        const interval = setInterval(() => {
            cargarFPY();
        }, 5 * 60 * 1000); // ⏱️ 10 minutos

        return () => clearInterval(interval);
    }, []);

    const cargarFPY = async () => {
        const fechaMX = getFechaMX();
        const ref = doc(db, "FPY", fechaMX);
        const snap = await getDoc(ref);

        const resultado = {
            Liberados: {},
            MT: {},
            ST: {},
            FI: {},
            Total: {
                Liberados: 0,
                MT: 0,
                ST: 0,
                FI: 0
            }
        };

        // Inicializar
        lineas.forEach(l => {
            resultado.Liberados[l] = 0;
            resultado.MT[l] = 0;
            resultado.ST[l] = 0;
            resultado.FI[l] = 0;
        });

        if (!snap.exists()) {
            setData(resultado);
            return;
        }

        const fpy = snap.data();

        lineas.forEach(l => {
            const liberados = fpy[`Liberados${l}`] || 0;
            const mt = fpy[`Rechazados${l}MT`] || 0;
            const st = fpy[`Rechazados${l}ST`] || 0;
            const fi = fpy[`Rechazados${l}FI`] || 0;

            resultado.Liberados[l] = liberados;
            resultado.MT[l] = mt;
            resultado.ST[l] = st;
            resultado.FI[l] = fi;

            resultado.Total.Liberados += liberados;
            resultado.Total.MT += mt;
            resultado.Total.ST += st;
            resultado.Total.FI += fi;
        });

        setData(resultado);
    };

    /* ================= DATA GRÁFICA ================= */

    const fpyChartData = lineas.map(l => ({
        linea: l,
        MT: calcularFPY(data.Liberados[l], data.MT[l]),
        ST: calcularFPY(data.Liberados[l], data.ST[l]),
        FI: calcularFPY(data.Liberados[l], data.FI[l])
    }));

    /* ================= RENDER ================= */

    return (
        <div className="p-6 bg-gray-800 space-y-8">

            {/* ================= TABLA ================= */}
            <div className="bg-gray-800">
                <div className="flex justify-between items-center ">
                    <h1 className="text-white text-3xl font-bold ">
                        Produccion actual: 
                    </h1>
                    <h1 className="text-4xl font-bold text-center rounded-md w-64 text-white bg-green-800">
                        {data.Total.Liberados} Motores
                    </h1>
                     <div>
                    <img src={live} alt="" className="w-20 pb-5" />
                </div>
                </div>


                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-800 text-white text-sm uppercase">
                                <th className="px-4 py-3 text-left">Estacion</th>
                                <th className="px-4 py-3 text-center">L1</th>
                                <th className="px-4 py-3 text-center">L2</th>
                                <th className="px-4 py-3 text-center">L3</th>
                                <th className="px-4 py-3 text-center">LSA</th>
                                <th className="px-4 py-3 text-center">TOTAL</th>
                            </tr>
                        </thead>

                        <tbody className="text-sm text-white">
                            <tr className="bg-green-800 font-semibold text-green-800">
                                <td className="px-4 py-2 text-white">Liberados</td>
                                {lineas.map(l => (
                                    <td key={l} className="px-4 py-2 text-center text-white">
                                        {data.Liberados[l]}
                                    </td>
                                ))}
                                <td className="px-4 py-2 text-center font-bold text-white">
                                    {data.Total.Liberados}
                                </td>
                            </tr>

                            {Object.entries(estaciones).map(([key, label]) => (
                                <tr key={key} className="even:bg-gray-800">
                                    <td className="px-4 py-2 font-medium">{label}</td>
                                    {lineas.map(l => (
                                        <td key={l} className="px-4 py-2 text-center">
                                            {data[key][l]}
                                        </td>
                                    ))}
                                    <td className="px-4 py-2 text-center font-bold">
                                        {data.Total[key]}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= GRÁFICA ================= */}
            <div className="bg-gray-800 rounded-lg shadow-md p-4">
                <h4 className="font-semibold text-white mb-4">
                    FPY por Línea y Estación (%)
                </h4>
               

                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={fpyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="linea" />
                        <YAxis domain={[90, 100]} tickFormatter={v => `${v}%`} />
                        <Tooltip formatter={v => `${v}%`} />
                        <Legend />
                        <Bar dataKey="MT" fill="#facc15" name="Motor Test" />
                        <Bar dataKey="ST" fill="#38bdf8" name="System Test" />
                        <Bar dataKey="FI" fill="#22c55e" name="Final Inspection" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <p className="text-xs text-white">
                Actualización automática cada 5 minutos · Fecha: {getFechaMX()}
            </p>
        </div>
    );
}
