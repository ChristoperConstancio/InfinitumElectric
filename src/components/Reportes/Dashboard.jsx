import { useEffect, useState, useRef } from "react";
import {
  getFirestore,
  doc,
  getDoc
} from "firebase/firestore";
import live from "../../assets/live.gif";

/* ================= CONFIG ================= */
const lineas = ["L1", "L2", "L3", "LSA"];

const calcularFPY = (liberados, rechazados) => {
  const total = liberados + rechazados;
  if (total === 0) return 100;
  return +((liberados / total) * 100).toFixed(1);
};
const calcularFPYLinea = (liberados, mt, st, fi) => {
  const rechazados = mt + st + fi;
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
    Total: { Liberados: 0, MT: 0, ST: 0, FI: 0, Recuperados: 0 },
  };
  lineas.forEach((l) => {
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
  const [fecha, setFecha]       = useState("");
  const [fechaISO, setFechaISO] = useState("");
  const [data, setData]         = useState(crearEstructuraFPY(lineas));
  const [compartiendo, setCompartiendo] = useState(false);
  const [horaCorte, setHoraCorte]       = useState("");

  const reporteRef = useRef(null);

  /* ── Inicializar fecha ── */
  useEffect(() => {
    const hoy = new Date();
    const year  = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day   = String(hoy.getDate()).padStart(2, "0");
    setFechaISO(`${year}-${month}-${day}`);
    setFecha(`${hoy.getDate()}-${hoy.getMonth() + 1}-${year}`);
  }, []);

  /* ── Cargar FPY ── */
  useEffect(() => {
    if (!fecha) return;
    const cargarFPY = async () => {
      const ref  = doc(db, "FPY", fecha);
      const snap = await getDoc(ref);
      const resultado = crearEstructuraFPY(lineas);
      if (snap.exists()) {
        const fpy = snap.data();
        const recuperados = fpy["recuperado"] || 0;
        lineas.forEach((l) => {
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
        resultado.Total.Recuperados = recuperados;
      }
      setData(resultado);
    };
    cargarFPY();
    const interval = setInterval(cargarFPY, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fecha]);

  /* ── KPIs ── */
  const fpyMT = calcularFPY(data.Total.Liberados, data.Total.MT);
  const fpyST = calcularFPY(data.Total.Liberados, data.Total.ST);
  const fpyFI = calcularFPY(data.Total.Liberados, data.Total.FI);

  // ── Configuración de turno según día ──
  // Sábado (día 6): meta 50 motores, turno 7:30 AM – 3:00 PM (7.5 hrs)
  // Lunes–Viernes:  meta 142 motores, turno 7:30 AM – 5:00 PM (9.5 hrs)
  const ahora = new Date();

  // Usamos la fecha seleccionada para detectar el día de la semana
  const fechaSeleccionada = fechaISO ? new Date(`${fechaISO}T12:00:00`) : ahora;
  const esSabado = fechaSeleccionada.getDay() === 6;

const META_HORA = esSabado ?  7 : 19;
  const META_TURNO      = esSabado ? 55  : 180;
  const DURACION_TURNO  = esSabado ? 7.5 : 9.5;  // horas
  const HORA_FIN        = esSabado ? 15  : 17;    // 3 PM o 5 PM

  const inicioTurno = new Date(); inicioTurno.setHours(7, 30, 0, 0);
  const finTurno    = new Date(); finTurno.setHours(HORA_FIN, 0, 0, 0);

  let horasTrabajadas = 0;
  if (ahora <= inicioTurno)       horasTrabajadas = 0;
  else if (ahora >= finTurno)     horasTrabajadas = DURACION_TURNO;
  else horasTrabajadas = (ahora - inicioTurno) / (1000 * 60 * 60);

  const metaPorHora    = META_TURNO / DURACION_TURNO;
  const metaAcumulada  = metaPorHora * horasTrabajadas;
  const motoresPorHora = horasTrabajadas === 0 ? 0 : (data.Total.Liberados / horasTrabajadas).toFixed(1);
  const cumplimiento   = metaAcumulada === 0 ? 0 : ((data.Total.Liberados / metaAcumulada) * 100).toFixed(1);
  const enMeta         = data.Total.Liberados >= metaAcumulada;
  const analizados     = data.Total.MT + data.Total.ST + data.Total.FI;
  const porcentajeRecuperacion = analizados === 0 ? 0 : ((data.Total.Recuperados / analizados) * 100).toFixed(1);

  /* ── Compartir captura ── */
  const handleCompartir = async () => {
    const elemento = reporteRef.current;
    if (!elemento) return;
    setCompartiendo(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      // ── Clon con layout forzado a desktop ──
      // Tailwind calcula breakpoints según el viewport del navegador, no el
      // ancho del elemento. En móvil el viewport es ~390px aunque el clon
      // tenga 900px, por eso los grids siguen en 1 columna.
      // Solución: inyectamos un <style> que fuerza el layout desktop
      // directamente en el clon, sin depender de breakpoints.
      const ANCHO = 900;

      const wrapper = document.createElement("div");
      wrapper.style.position      = "absolute";
      wrapper.style.top           = "0px";
      wrapper.style.left          = "-9999px";
      wrapper.style.width         = `${ANCHO}px`;
      wrapper.style.overflow      = "visible";
      wrapper.style.pointerEvents = "none";
      document.body.appendChild(wrapper);

      const clon = elemento.cloneNode(true);
      clon.style.width    = `${ANCHO}px`;
      clon.style.maxWidth = "none";
      clon.style.overflow = "visible";

      // Inyectamos estilos que fuerzan el layout de desktop
      // sin importar el viewport real del dispositivo
      const estiloDesktop = document.createElement("style");
      estiloDesktop.textContent = `
        /* Forzar grid de 3 columnas (equivale a sm:grid-cols-3) */
        [data-capture] .grid { display: grid !important; }
        [data-capture] .grid-cols-1 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        /* Forzar textos tamaño desktop (md:text-3xl, md:text-5xl) */
        [data-capture] .text-2xl  { font-size: 1.5rem   !important; line-height: 2rem !important; }
        [data-capture] .text-4xl  { font-size: 2.25rem  !important; line-height: 2.5rem !important; }
        [data-capture] .md\\:text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        [data-capture] .md\\:text-5xl { font-size: 3rem     !important; line-height: 1 !important; }
        /* Header en fila */
        [data-capture] .flex-col  { flex-direction: row !important; }
        [data-capture] .flex-wrap { flex-wrap: nowrap   !important; }
        /* Tabla sin scroll forzado */
        [data-capture] .overflow-x-auto { overflow: visible !important; }
      `;
      clon.setAttribute("data-capture", "true");
      clon.appendChild(estiloDesktop);

      wrapper.appendChild(clon);

      // Esperamos que el navegador recalcule el layout con los nuevos estilos
      await new Promise((r) => setTimeout(r, 200));

      const alturaReal = clon.scrollHeight || clon.offsetHeight;

      const canvas = await html2canvas(clon, {
        backgroundColor: "#1f2937",
        scale: 2,
        useCORS: true,
        logging: false,
        width:        ANCHO,
        height:       alturaReal,
        windowWidth:  ANCHO,
        windowHeight: alturaReal,
        scrollX:      0,
        scrollY:      0,
        x:            0,
        y:            0,
      });

      document.body.removeChild(wrapper);

      // Hora de cierre formateada
      const horaActual = new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Mexico_City",
      });
      setHoraCorte(horaActual);

      const textoCompartir = `Se comparte reporte de producción con cierre a las ${horaActual}`;

      // Convertimos toBlob a Promise para poder usar await y que el
      // finally espere a que todo termine antes de quitar el spinner
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) throw new Error("No se pudo generar la imagen");

      const file = new File([blob], `reporte-produccion-${fecha}.png`, { type: "image/png" });

      // Web Share API con archivos (móviles modernos)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Reporte de Producción — FPY",
          text: textoCompartir,
          files: [file],
        });
      } else if (navigator.share) {
        // Algunos móviles soportan share pero no con archivos — compartimos solo texto + URL blob
        const url = URL.createObjectURL(blob);
        await navigator.share({
          title: "Reporte de Producción — FPY",
          text: textoCompartir,
          url,
        });
        URL.revokeObjectURL(url);
      } else {
        // Fallback desktop: descarga directa
        const url = URL.createObjectURL(blob);
        const a   = document.createElement("a");
        a.href     = url;
        a.download = `reporte-produccion-${fecha}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

    } catch (err) {
      // AbortError = usuario canceló el share, no es un error real
      if (err?.name !== "AbortError") {
        console.error("Error al compartir:", err);
      }
    } finally {
      setCompartiendo(false);
    }
  };

  /* ── Helpers de color ── */
  const colorFPY    = (v) => v >= 98 ? "text-green-400" : "text-red-500";
  const colorMeta   = (ok) => ok ? "text-green-400" : "text-red-500";

  /* ================= RENDER ================= */
  return (
    <div className="bg-gray-800 min-h-screen">

      {/* ── Selector de fecha FUERA de la captura ── */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        <input
          type="date"
          className="bg-gray-700 text-white p-2 rounded text-sm"
          value={fechaISO}
          onChange={(e) => {
            const value = e.target.value;
            setFechaISO(value);
            const [year, month, day] = value.split("-");
            setFecha(`${Number(day)}-${Number(month)}-${year}`);
          }}
        />
      </div>

      {/* ── Zona capturable ── */}
      <div ref={reporteRef} className="p-4 md:p-6 space-y-6 bg-gray-800">

        {/* HEADER — elementos estáticos para html2canvas */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-white text-2xl md:text-3xl font-bold">
            Producción – FPY
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Fecha como texto plano */}
            <div className="flex items-center gap-2">
              <span className="bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium">
                {fechaISO}
              </span>
              {horaCorte && (
                <span className="bg-gray-700 text-amber-400 px-3 py-2 rounded text-sm font-semibold whitespace-nowrap">
                  Corte: {horaCorte}
                </span>
              )}
            </div>
            {/* Contador motores */}
            <div className="bg-green-800 text-white text-xl md:text-3xl font-bold rounded-md px-4 py-2 text-center">
              {data.Total.Liberados} Motores
            </div>
            {/* LIVE estático sin GIF */}
            <div className="flex items-center gap-1.5 bg-green-950 border border-green-700 rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              <span className="text-green-400 text-xs font-bold tracking-wide">LIVE</span>
            </div>
          </div>
        </div>

        {/* KPI principal — 3 columnas en md, 1 columna en móvil */}




        {/* KPI FPY — 3 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {[
            { label: "Motor Test FPY",       fpy: fpyMT, rechazos: data.Total.MT  },
            { label: "System Test FPY",      fpy: fpyST, rechazos: data.Total.ST  },
            { label: "Final Inspection FPY", fpy: fpyFI, rechazos: data.Total.FI  },
          ].map(({ label, fpy, rechazos }) => (
            <div key={label} className="bg-gray-900 p-5 rounded-xl shadow-lg text-center">
              <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</h2>
              <p className={`text-4xl md:text-5xl font-bold ${colorFPY(fpy)}`}>{fpy}%</p>
              <p className="text-xs text-gray-400 mt-2">Rechazos: {rechazos}</p>
            </div>
          ))}

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-gray-900 p-5 rounded-xl shadow-lg text-center">
            <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-1">Motores / Hora</h2>
            <p className={`text-4xl md:text-5xl font-bold ${colorMeta(enMeta)}`}>{motoresPorHora}</p>
            <p className="text-xs text-gray-400 mt-2">Meta: {META_HORA}</p>
            {esSabado && (
              <p className="text-[10px] text-amber-400 mt-1 font-medium">Sábado · Corte 3:00 PM</p>
            )}
          </div>

          <div className="bg-gray-900 p-5 rounded-xl shadow-lg text-center">
            <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-1">Adherencia</h2>
            <p className={`text-4xl md:text-5xl font-bold ${colorMeta(cumplimiento >= 100)}`}>{cumplimiento}%</p>
            <p className="text-xs text-gray-400 mt-2">
              Meta: {META_TURNO} · Acum: {metaAcumulada.toFixed(0)}
            </p>
            {esSabado && (
              <p className="text-[10px] text-amber-400 mt-1 font-medium">Turno sábado 7:30 – 15:00</p>
            )}
          </div>

          <div className="bg-gray-900 p-5 rounded-xl shadow-lg text-center">
            <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-1">Rechazos / Recuperados</h2>
            <p className="text-4xl md:text-5xl font-bold text-white">
              {analizados} / {data.Total.Recuperados}
            </p>
            <p className={`text-base mt-2 font-semibold ${
              porcentajeRecuperacion >= 80 ? "text-green-400"
              : porcentajeRecuperacion >= 50 ? "text-yellow-400"
              : "text-red-500"
            }`}>{porcentajeRecuperacion}%</p>
          </div>

        </div>
        {/* TABLA */}
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full bg-gray-800 rounded-xl shadow-md text-sm">
            <thead>
              <tr className="text-white uppercase text-xs bg-gray-900">
                <th className="px-3 py-3 text-left">Línea</th>
                <th className="px-3 py-3 text-center">MT %</th>
                <th className="px-3 py-3 text-center">ST %</th>
                <th className="px-3 py-3 text-center">FI %</th>
                <th className="px-3 py-3 text-center">Finish Good</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {lineas.map((l) => {
                const fpyMTL = calcularFPY(data.Liberados[l], data.MT[l]);
                const fpySTL = calcularFPY(data.Liberados[l], data.ST[l]);
                const fpyFIL = calcularFPY(data.Liberados[l], data.FI[l]);
                return (
                  <tr key={l} className="border-t border-gray-700">
                    <td className="px-3 py-3 font-semibold bg-gray-900">{l}</td>
                    <td className={`px-3 py-3 text-center font-bold ${colorFPY(fpyMTL)}`}>
                      {fpyMTL}% <span className="text-gray-500 font-normal">({data.MT[l]})</span>
                    </td>
                    <td className={`px-3 py-3 text-center font-bold ${colorFPY(fpySTL)}`}>
                      {fpySTL}% <span className="text-gray-500 font-normal">({data.ST[l]})</span>
                    </td>
                    <td className={`px-3 py-3 text-center font-bold ${colorFPY(fpyFIL)}`}>
                      {fpyFIL}% <span className="text-gray-500 font-normal">({data.FI[l]})</span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-400">
                      {data.Liberados[l]}
                    </td>
                  </tr>
                );
              })}

              {/* Fila GLOBAL */}
              <tr className="bg-gray-900 border-t border-white font-bold">
                <td className="px-3 py-3">GLOBAL</td>
                <td className={`px-3 py-3 text-center ${colorFPY(fpyMT)}`}>{fpyMT}%</td>
                <td className={`px-3 py-3 text-center ${colorFPY(fpyST)}`}>{fpyST}%</td>
                <td className={`px-3 py-3 text-center ${colorFPY(fpyFI)}`}>{fpyFI}%</td>
                <td className="px-3 py-3 text-center text-blue-400">{data.Total.Liberados}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400">Fecha: {fecha}</p>

      </div>
      {/* Fin zona capturable */}

      {/* ── Botón compartir (fuera de la captura) ── */}
      <div className="px-4 pb-8 pt-2">
        <button
          onClick={handleCompartir}
          disabled={compartiendo}
          className="
            w-full flex items-center justify-center gap-2
            bg-gray-700 hover:bg-gray-600 active:bg-gray-900
            border border-gray-500 hover:border-gray-400
            text-white font-semibold py-4 rounded-xl
            transition-all text-sm
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {compartiendo ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generando imagen…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Compartir reporte
            </>
          )}
        </button>
      </div>

    </div>
  );
}
