import { useEffect, useState } from "react";
import {
    getFirestore,
    collection,
    getDocs
} from "firebase/firestore";

const lineas = ["L1", "L2", "L3", "LSA"];

const estaciones = {
    MT: "Motor Test",
    ST: "System Test",
    FI: "Final Inspection"
};


export default function TablaFPYSencilla() {
    const db = getFirestore();
const [rechazos, setRechazos] = useState([]);
const [loading, setLoading] = useState(true);

    const [data, setData] = useState({
        Liberados: {},
        MT: {},
        ST: {},
        FI: {}
    });

    useEffect(() => {
        cargarDatos();
        cargarRechazos();
    }, []);



    const cargarDatos = async () => {
        const resultado = {
            Liberados: {},
            MT: {},
            ST: {},
            FI: {}
        };

        lineas.forEach(l => {
            resultado.Liberados[l] = 0;
            resultado.MT[l] = 0;
            resultado.ST[l] = 0;
            resultado.FI[l] = 0;
        });

        // 🔹 LIBERADOS
        const liberadosSnap = await getDocs(collection(db, "Liberados"));
        liberadosSnap.forEach(doc => {
            const { linea } = doc.data();
            if (resultado.Liberados[linea] !== undefined) {
                resultado.Liberados[linea]++;
            }
        });

        // 🔹 RECHAZOS
        const rechazosSnap = await getDocs(collection(db, "Rechazos"));
        rechazosSnap.forEach(doc => {
            const { Estacion } = doc.data();

            // "Linea 1 MT" → ["Linea", "1", "MT"]
            const partes = Estacion.split(" ");
            const linea = `L${partes[1]}`;   // L1
            const estacion = partes[2];      // MT

            if (
                resultado[estacion] &&
                resultado[estacion][linea] !== undefined
            ) {
                resultado[estacion][linea]++;
            }
        });

        setData(resultado);
    };
    const cargarRechazos = async () => {
        const lista = [];
        const snap = await getDocs(collection(db, "Rechazos"));
        snap.forEach(doc => {
            lista.push({
                id: doc.id,
                ...doc.data()
            });
        });

        setRechazos(lista);
        setLoading(false);
    };
    return (
        <>
            <div className="p-6 bg-gray-50 space-y-10">

                {/* ================= FPY ================= */}
                <div>
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                        FPY – Resumen por Línea
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg shadow-md">
                            <thead>
                                <tr className="bg-gray-800 text-white text-sm uppercase">
                                    <th className="px-4 py-3 text-left">Proceso</th>
                                    <th className="px-4 py-3 text-center">Línea 1</th>
                                    <th className="px-4 py-3 text-center">Línea 2</th>
                                    <th className="px-4 py-3 text-center">Línea 3</th>
                                    <th className="px-4 py-3 text-center">Línea SA</th>
                                </tr>
                            </thead>

                            <tbody className="text-sm text-gray-700">
                                <tr className="bg-green-100 font-semibold text-green-800">
                                    <td className="px-4 py-2">Liberados</td>
                                    {lineas.map(l => (
                                        <td key={l} className="px-4 py-2 text-center">
                                            {data.Liberados[l]}
                                        </td>
                                    ))}
                                </tr>

                                {Object.entries(estaciones).map(([key, label]) => (
                                    <tr
                                        key={key}
                                        className="even:bg-gray-50 hover:bg-gray-100 transition"
                                    >
                                        <td className="px-4 py-2 font-medium">{label}</td>
                                        {lineas.map(l => (
                                            <td key={l} className="px-4 py-2 text-center">
                                                {data[key][l]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ================= RECHAZOS ================= */}
                <div>
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">
                        Rechazos registrados
                    </h3>

                    {loading ? (
                        <p className="text-gray-600">Cargando rechazos...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-red-700 text-white text-sm uppercase">
                                        <th className="px-4 py-3 text-left">Motor</th>
                                        <th className="px-4 py-3 text-center">Línea</th>
                                        <th className="px-4 py-3 text-center">Razon</th>
                                        <th className="px-4 py-3 text-center">Fecha</th>
                                    </tr>
                                </thead>

                                <tbody className="text-sm text-gray-700">
                                    {rechazos.map(r => (
                                        <tr
                                            key={r.id}
                                            className="even:bg-gray-50 hover:bg-gray-100 transition"
                                        >
                                            <td className="px-4 py-2 font-mono">
                                                {r.SN_Motor}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {r.Estacion}
                                            </td>
                                            <td className="px-4 py-2">
                                                {r.Razon || "-"}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {r.Comentarios}
                                            </td>
                                        </tr>
                                    ))}

                                    {rechazos.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-4 py-6 text-center text-gray-500"
                                            >
                                                No hay rechazos registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}
