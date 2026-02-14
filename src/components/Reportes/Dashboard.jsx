import { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc
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
  return +((liberados / total) * 100).toFixed(1);
};

/* ================= UTILIDAD FPY ================= */

const crearEstructuraFPY = (lineas) => {
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

  return resultado;
};

/* ================= COMPONENTE ================= */

export default function TablaFPY() {
  const db = getFirestore();

  const [fecha, setFecha] = useState("");
  const [fechaISO, setFechaISO] = useState("");
  const [data, setData] = useState(crearEstructuraFPY(lineas));

  /* ================= INICIALIZAR CON HOY ================= */

  useEffect(() => {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    const iso = `${year}-${month}-${day}`;
    setFechaISO(iso);

    setFecha(`${hoy.getDate()}-${hoy.getMonth() + 1}-${year}`);
  }, []);

  /* ================= CARGAR FPY ================= */

  useEffect(() => {
    if (!fecha) return;

    const cargarFPY = async () => {
      const ref = doc(db, "FPY", fecha);
      const snap = await getDoc(ref);

      const resultado = crearEstructuraFPY(lineas);

      if (snap.exists()) {
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
      }

      setData(resultado);
    };

    cargarFPY();

    const interval = setInterval(cargarFPY, 5 * 60 * 1000);
    return () => clearInterval(interval);

  }, [fecha]);

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

      <div className="flex justify-between items-center">
        <h1 className="text-white text-3xl font-bold">
          Producción – FPY
        </h1>

        {/* ✅ CALENDARIO FUNCIONAL */}
        <input
          type="date"
          className="bg-gray-700 text-white p-2 rounded"
          value={fechaISO}
          onChange={(e) => {
            const value = e.target.value; // 2026-02-11
            setFechaISO(value);

            const [year, month, day] = value.split("-");
            setFecha(`${Number(day)}-${Number(month)}-${year}`);
          }}
        />

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
              <th className="px-4 py-3 text-center">Global</th>
            </tr>
          </thead>

          <tbody className="text-sm text-white">
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
            <tr>
              <td className="px-4 py-2">System Test</td>
              {lineas.map(l => {
                const rechazados = data.ST[l];
                const fpy = calcularFPY(data.Liberados[l], rechazados);
                return (
                  <td key={l} className="px-4 py-2 text-center">
                    {rechazados} ({fpy}%)
                  </td>
                );
              })}
              <td className="px-4 py-2 text-center font-bold">
                {data.Total.ST} ({calcularFPY(data.Total.Liberados, data.Total.ST)}%)
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2">Motor Test</td>
              {lineas.map(l => {
                const rechazados = data.MT[l];
                const fpy = calcularFPY(data.Liberados[l], rechazados);
                return (
                  <td key={l} className="px-4 py-2 text-center">
                    {rechazados} ({fpy}%)
                  </td>
                );
              })}
              <td className="px-4 py-2 text-center font-bold">
                {data.Total.MT} ({calcularFPY(data.Total.Liberados, data.Total.MT)}%)
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2">Final Inspection</td>
              {lineas.map(l => {
                const rechazados = data.FI[l];
                const fpy = calcularFPY(data.Liberados[l], rechazados);
                return (
                  <td key={l} className="px-4 py-2 text-center">
                    {rechazados} ({fpy}%)
                  </td>
                );
              })}
              <td className="px-4 py-2 text-center font-bold">
                {data.Total.FI} ({calcularFPY(data.Total.Liberados, data.Total.FI)}%)
              </td>
            </tr>

          </tbody>
        </table>
      </div>

      <p className="text-xs text-white">
        Fecha actual: {fecha}
      </p>

    </div>
  );
}

