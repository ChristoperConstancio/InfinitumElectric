import { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection
} from "firebase/firestore";
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
import live from "../../assets/live.gif";

/* ================= CONFIG ================= */

const lineas = ["L1", "L2", "L3", "LSA"];

const calcularFPY = (liberados, rechazados) => {
  const total = liberados + rechazados;
  if (total === 0) return 100;
  return +(liberados / total * 100).toFixed(1);
};

/* ================= COMPONENTE ================= */

export default function TablaFPY() {
  const db = getFirestore();

  const [fechas, setFechas] = useState([]);
  const [fecha, setFecha] = useState("");
  const [data, setData] = useState({
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
  });

  /* ================= CARGAR FECHAS ================= */

  useEffect(() => {
    const cargarFechas = async () => {
      const snap = await getDocs(collection(db, "FPY"));

      const lista = snap.docs
        .map(d => d.id)
        .sort((a, b) => {
          const [da, ma, ya] = a.split("-").map(Number);
          const [db, mb, yb] = b.split("-").map(Number);
          return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
        });

      setFechas(lista);
      if (lista.length) setFecha(lista[0]);
    };

    cargarFechas();
  }, []);

  /* ================= CARGAR FPY ================= */

  useEffect(() => {
    if (!fecha) return;

    cargarFPY();
    const interval = setInterval(cargarFPY, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fecha]);

  const cargarFPY = async () => {
    const ref = doc(db, "FPY", fecha);
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

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-white text-3xl font-bold">
          Producción – FPY
        </h1>

        <select
          className="bg-gray-700 text-white p-2 rounded"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        >
          {fechas.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold rounded-md w-64 text-white bg-green-800 text-center">
            {data.Total.Liberados} Motores
          </h1>
          <img src={live} alt="" className="w-20 pb-5" />
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg shadow-md">
          <thead>
            <tr className="text-white uppercase text-sm">
              <th className="px-4 py-3 text-left">Estación</th>
              {lineas.map(l => (
                <th key={l} className="px-4 py-3 text-center">{l}</th>
              ))}
              <th className="px-4 py-3 text-center">TOTAL</th>
            </tr>
          </thead>

          <tbody className="text-sm text-white">

            {/* LIBERADOS */}
            <tr className="bg-green-800 font-semibold">
              <td className="px-4 py-2">Liberados</td>
              {lineas.map(l => (
                <td key={l} className="px-4 py-2 text-center">
                  {data.Liberados[l]}
                </td>
              ))}
              <td className="px-4 py-2 text-center font-bold">
                {data.Total.Liberados}
              </td>
            </tr>

            {/* MT */}
            <tr>
              <td className="px-4 py-2">Motor Test</td>
              {lineas.map(l => (
                <td key={l} className="px-4 py-2 text-center">{data.MT[l]}</td>
              ))}
              <td className="px-4 py-2 text-center font-bold">{data.Total.MT}</td>
            </tr>
            <tr className="bg-gray-700 text-yellow-300 font-semibold">
              <td className="px-4 py-2">FPY MT (%)</td>
              {lineas.map(l => (
                <td key={l} className="px-4 py-2 text-center">
                  {calcularFPY(data.Liberados[l], data.MT[l])}%
                </td>
              ))}
              <td className="px-4 py-2 text-center font-bold">
                {calcularFPY(data.Total.Liberados, data.Total.MT)}%
              </td>
            </tr>

            {/* ST */}
            <tr>
              <td className="px-4 py-2">System Test</td>
              {lineas.map(l => (
                <td key={l} className="px-4 py-2 text-center">{data.ST[l]}</td>
              ))}
              <td className="px-4 py-2 text-center font-bold">{data.Total.ST}</td>
            </tr>
            <tr className="bg-gray-700 text-sky-300 font-semibold">
              <td className="px-4 py-2">FPY ST (%)</td>
              {lineas.map(l => (
                <td key={l} className="px-4 py-2 text-center">
                  {calcularFPY(data.Liberados[l], data.ST[l])}%
                </td>
              ))}
              <td className="px-4 py-2 text-center font-bold">
                {calcularFPY(data.Total.Liberados, data.Total.ST)}%
              </td>
            </tr>

            {/* FI */}
            <tr>
              <td className="px-4 py-2">Final Inspection</td>
              {lineas.map(l => (
                <td key={l} className="px-4 py-2 text-center">{data.FI[l]}</td>
              ))}
              <td className="px-4 py-2 text-center font-bold">{data.Total.FI}</td>
            </tr>
            <tr className="bg-gray-700 text-green-300 font-semibold">
              <td className="px-4 py-2">FPY FI (%)</td>
              {lineas.map(l => (
                <td key={l} className="px-4 py-2 text-center">
                  {calcularFPY(data.Liberados[l], data.FI[l])}%
                </td>
              ))}
              <td className="px-4 py-2 text-center font-bold">
                {calcularFPY(data.Total.Liberados, data.Total.FI)}%
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* GRÁFICA */}
      <div className="bg-gray-800 rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-white mb-4">
          FPY por Línea (%)
        </h4>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={fpyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="linea" />
            <YAxis domain={[90, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={v => `${v}%`} />
            <Legend />
            <Bar dataKey="MT" fill="#facc15" />
            <Bar dataKey="ST" fill="#38bdf8" />
            <Bar dataKey="FI" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-white">
        Actualización automática cada 5 minutos · Fecha: {fecha}
      </p>
    </div>
  );
}
