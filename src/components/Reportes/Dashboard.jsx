import { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc
} from "firebase/firestore";
import live from "../../assets/live.gif";

/* ================= CONFIG ================= */

const lineas = ["L1", "L2", "L3", "LSA"];
const META_HORA = 15;
const INICIO_TURNO = 6; // 6 AM

const calcularFPY = (liberados, rechazados) => {
  const total = liberados + rechazados;
  if (total === 0) return 100;
  return +((liberados / total) * 100).toFixed(1);
};

const crearEstructuraFPY = (lineas) => {
  const resultado = {
    Liberados: {},
    MT: {},
    ST: {},
    FI: {},
    Recuperados: {}, // 👈 NUEVO
    Total: {
      Liberados: 0,
      MT: 0,
      ST: 0,
      FI: 0,
      Recuperados: 0 // 👈 NUEVO
    }
  };

  lineas.forEach(l => {
    resultado.Liberados[l] = 0;
    resultado.MT[l] = 0;
    resultado.ST[l] = 0;
    resultado.FI[l] = 0;
    resultado.Recuperados[l] = 0; // 👈 NUEVO
  });

  return resultado;
};


export default function DashboardFPY() {

  const db = getFirestore();
  const [fecha, setFecha] = useState("");
  const [fechaISO, setFechaISO] = useState("");
  const [data, setData] = useState(crearEstructuraFPY(lineas));

  /* ================= INICIALIZAR FECHA ================= */

  useEffect(() => {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    setFechaISO(`${year}-${month}-${day}`);
    setFecha(`${hoy.getDate()}-${hoy.getMonth() + 1}-${year}`);
  }, []);

  /* ================= CARGAR FPY ================= */
  const fpyMT = calcularFPY(
    data.Total.Liberados,
    data.Total.MT
  );

  const fpyST = calcularFPY(
    data.Total.Liberados,
    data.Total.ST
  );

  const fpyFI = calcularFPY(
    data.Total.Liberados,
    data.Total.FI
  );
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
          const recuperados = fpy['recuperados'] || 0;

          resultado.Liberados[l] = liberados;
          resultado.MT[l] = mt;
          resultado.ST[l] = st;
          resultado.FI[l] = fi;
          resultado.Recuperados[l] = recuperados;

          resultado.Total.Liberados += liberados;
          resultado.Total.MT += mt;
          resultado.Total.ST += st;
          resultado.Total.FI += fi;
          resultado.Total.Recuperados += recuperados;

        });
      }

      setData(resultado);
    };

    cargarFPY();
    const interval = setInterval(cargarFPY, 5 * 60 * 1000);
    return () => clearInterval(interval);

  }, [fecha]);

  /* ================= KPI ADHERENCIA ================= */

  const META_TURNO = 142;

  const ahora = new Date();

  // Hora inicio turno 7:30 AM
  const inicioTurno = new Date();
  inicioTurno.setHours(7, 30, 0, 0);

  // Hora fin turno 5:00 PM
  const finTurno = new Date();
  finTurno.setHours(17, 0, 0, 0);

  // Calcular horas trabajadas reales en decimal
  let horasTrabajadas = 0;

  if (ahora <= inicioTurno) {
    horasTrabajadas = 0;
  } else if (ahora >= finTurno) {
    horasTrabajadas = 9.5;
  } else {
    horasTrabajadas = (ahora - inicioTurno) / (1000 * 60 * 60);
  }

  // Meta por hora exacta
  const metaPorHora = META_TURNO / 9.5;

  // Meta acumulada hasta el momento
  const metaAcumulada = metaPorHora * horasTrabajadas;

  // Motores por hora reales
  const motoresPorHora =
    horasTrabajadas === 0
      ? 0
      : (data.Total.Liberados / horasTrabajadas).toFixed(1);

  // Cumplimiento %
  const cumplimiento =
    metaAcumulada === 0
      ? 0
      : ((data.Total.Liberados / metaAcumulada) * 100).toFixed(1);

  const enMeta = data.Total.Liberados >= metaAcumulada;
  const analizados =
    data.Total.MT + data.Total.ST + data.Total.FI;

  const porcentajeRecuperacion =
    analizados === 0
      ? 0
      : ((data.Total.Recuperados / analizados) * 100).toFixed(1);

  /* ================= RENDER ================= */

  return (
    <div className="p-6 bg-gray-800 min-h-screen space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-white text-3xl font-bold">
          Producción – FPY
        </h1>

        <input
          type="date"
          className="bg-gray-700 text-white p-2 rounded"
          value={fechaISO}
          onChange={(e) => {
            const value = e.target.value;
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

      {/* ================= KPI ================= */}

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-gray-400 text-sm uppercase">Motores / Hora</h2>
          <h1 className={`text-5xl font-bold ${enMeta ? "text-green-400" : "text-red-500"}`}>
            {motoresPorHora}
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            Meta: {META_HORA}
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-gray-400 text-sm uppercase">Adherencia</h2>
          <h1 className={`text-5xl font-bold ${cumplimiento >= 100 ? "text-green-400" : "text-red-500"}`}>
            {cumplimiento}%
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            Meta acumulada: {metaAcumulada}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-gray-400 text-sm uppercase">
            Rechazos / Recuperados
          </h2>

          <h1 className="text-5xl font-bold text-white">
            {analizados} / {data.Total.Recuperados} 
          </h1>

          <p className={`text-lg mt-2 font-semibold ${porcentajeRecuperacion >= 80
              ? "text-green-400"
              : porcentajeRecuperacion >= 50
                ? "text-yellow-400"
                : "text-red-500"
            }`}>
            {porcentajeRecuperacion}%
          </p>
        </div>

      </div>

      {/* Barra progreso */}
      <div className="bg-gray-900 p-4 rounded-xl">
        <div className="w-full bg-gray-700 h-6 rounded-full overflow-hidden">
          <div
            className={`h-6 ${cumplimiento >= 100 ? "bg-green-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(cumplimiento, 100)}%` }}
          />
        </div>
      </div>
      {/* ================= KPI FPY ================= */}

      <div className="grid grid-cols-3 gap-6">

        {/* MOTOR TEST */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-gray-400 text-sm uppercase">
            Motor Test FPY
          </h2>

          <h1 className={`text-5xl font-bold ${fpyMT >= 98 ? "text-green-400" : "text-red-500"
            }`}>
            {fpyMT}%
          </h1>

          <p className="text-xs text-gray-400 mt-2">
            Rechazos: {data.Total.MT}
          </p>
        </div>

        {/* SYSTEM TEST */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-gray-400 text-sm uppercase">
            System Test FPY
          </h2>

          <h1 className={`text-5xl font-bold ${fpyST >= 98 ? "text-green-400" : "text-red-500"
            }`}>
            {fpyST}%
          </h1>

          <p className="text-xs text-gray-400 mt-2">
            Rechazos: {data.Total.ST}
          </p>
        </div>

        {/* FINAL INSPECTION */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-gray-400 text-sm uppercase">
            Final Inspection FPY
          </h2>

          <h1 className={`text-5xl font-bold ${fpyFI >= 98 ? "text-green-400" : "text-red-500"
            }`}>
            {fpyFI}%
          </h1>

          <p className="text-xs text-gray-400 mt-2">
            Rechazos: {data.Total.FI}
          </p>
        </div>

      </div>

      {/* ================= TABLA ================= */}

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
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white">
        Fecha actual: {fecha}
      </p>

    </div>
  );
}
