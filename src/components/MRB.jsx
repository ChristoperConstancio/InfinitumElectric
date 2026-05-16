import { useState, useRef, useEffect } from "react";

// ─── Tipos de material ─────────────────────────────────────────────────────────
const TIPOS = {
  magneto: { label: "Magneto", bg: "bg-emerald-950", border: "border-emerald-700", text: "text-emerald-300", badge: "bg-emerald-900 text-emerald-300 border-emerald-700" },
  housing: { label: "Housing", bg: "bg-sky-950",     border: "border-sky-700",     text: "text-sky-300",    badge: "bg-sky-900 text-sky-300 border-sky-700"             },
  motores: { label: "Motores", bg: "bg-orange-950",  border: "border-orange-700",  text: "text-orange-300", badge: "bg-orange-900 text-orange-300 border-orange-700"    },
  empty:   { label: "Vacío",   bg: "bg-gray-800",    border: "border-gray-700",    text: "text-gray-600",   badge: "bg-gray-800 text-gray-500 border-gray-700"          },
};

// ─── Datos iniciales ───────────────────────────────────────────────────────────
function makeSlot(tipo = "empty", opts = {}) {
  return { tipo, part: "", qty: 0, wo: "", desc: "", fecha: "", ...opts };
}

function buildInitialData() {
  const d = {};

  // Rack A — 8 filas x 3 columnas  (A.fila.col)
  const tiposA = { 1:"motores", 2:"motores", 3:"magneto", 4:"magneto", 5:"magneto", 6:"housing", 7:"housing", 8:"housing" };
  for (let fila = 1; fila <= 8; fila++)
    for (let col = 1; col <= 3; col++)
      d[`A.${fila}.${col}`] = makeSlot(tiposA[fila] || "empty");

  d["A.1.1"] = makeSlot("motores", { part:"MOT-3310", qty:48, wo:"WO-2024-077", desc:"Motores defectuosos",   fecha:"2025-05-08" });
  d["A.3.2"] = makeSlot("magneto", { part:"MAG-1100", qty:60, wo:"WO-2024-081", desc:"Magnetos falla térmica",fecha:"2025-05-10" });
  d["A.3.1"] = makeSlot("magneto", { part:"MAG-2200", qty:60, wo:"WO-2024-082", desc:"Magnetos rechazados",   fecha:"2025-05-10" });
  d["A.2.3"] = makeSlot("magneto", { part:"MAG-550",  qty:36, wo:"WO-2024-079", desc:"Batch 550W",            fecha:"2025-05-09" });

  // Rack B — 8 columnas x 3 filas  (B.col.fila)
  const tiposB = { 1:"magneto", 2:"magneto", 3:"magneto", 4:"housing", 5:"housing", 6:"motores", 7:"motores", 8:"motores" };
  for (let col = 1; col <= 8; col++)
    for (let fila = 1; fila <= 3; fila++)
      d[`B.${col}.${fila}`] = makeSlot(tiposB[col] || "empty");

  d["B.1.3"] = makeSlot("magneto", { part:"MAG-550",  qty:60, wo:"WO-2024-083", desc:"550W batch 1",    fecha:"2025-05-11" });
  d["B.2.3"] = makeSlot("magneto", { part:"MAG-350",  qty:36, wo:"WO-2024-084", desc:"350W análisis",   fecha:"2025-05-11" });
  d["B.3.3"] = makeSlot("magneto", { part:"MAG-550B", qty:60, wo:"WO-2024-085", desc:"550W batch 2",    fecha:"2025-05-12" });
  d["B.5.2"] = makeSlot("housing", { part:"HSG-440",  qty:24, wo:"WO-2024-088", desc:"Housing dañado",  fecha:"2025-05-12" });

  // Rack C — 8 filas x 3 columnas  (C.fila.col)
  const tiposC = { 1:"motores", 2:"motores", 3:"magneto", 4:"magneto", 5:"housing", 6:"housing", 7:"housing", 8:"magneto" };
  for (let fila = 1; fila <= 8; fila++)
    for (let col = 1; col <= 3; col++)
      d[`C.${fila}.${col}`] = makeSlot(tiposC[fila] || "empty");

  d["C.1.1"] = makeSlot("motores", { part:"MOT-220", qty:18, wo:"WO-2024-070", desc:"Motores quemados",  fecha:"2025-05-07" });
  d["C.1.2"] = makeSlot("motores", { part:"MOT-440", qty:12, wo:"WO-2024-071", desc:"Motores en espera", fecha:"2025-05-07" });
  d["C.2.2"] = makeSlot("motores", { part:"MOT-880", qty:8,  wo:"WO-2024-072", desc:"Parcial — análisis",fecha:"2025-05-08" });
  d["C.6.1"] = makeSlot("housing", { part:"HSG-220", qty:30, wo:"WO-2024-090", desc:"Housing fracturado", fecha:"2025-05-12" });

  return d;
}

function buildInitialHistory() {
  return {
    "A.1.1": [{ type:"in",  text:"Entrada: 48 pzs MOT-3310", time:"08 May 11:30" }],
    "A.3.2": [{ type:"in",  text:"Entrada: 60 pzs MAG-1100", time:"10 May 09:14" }],
    "B.1.3": [{ type:"in",  text:"Entrada: 60 pzs MAG-550",  time:"11 May 08:00" }],
    "C.1.1": [{ type:"in",  text:"Entrada: 18 pzs MOT-220",  time:"07 May 08:00" }],
  };
}

// ─── Utilidades ────────────────────────────────────────────────────────────────
function nowLabel() {
  return new Date().toLocaleString("es-MX", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}
function isOccupied(slot) { return !!slot?.part; }

// ─── QR Canvas ─────────────────────────────────────────────────────────────────
function QRCanvas({ slotId, size = 120 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    const grid = 10, cell = Math.floor(size / grid);
    const seed = slotId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng  = (i) => ((seed * 9301 + (i + 1) * 49297) % 233280) / 233280;
    ctx.fillStyle = "#111";
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const corner = (r < 3 && c < 3)||(r < 3 && c >= grid-3)||(r >= grid-3 && c < 3);
        if (corner) {
          if (r===0||r===2||r===grid-3||r===grid-1||c===0||c===2||c===grid-3||c===grid-1
            ||(r===1&&c===1)||(r===1&&c===grid-2)||(r===grid-2&&c===1))
            ctx.fillRect(c*cell, r*cell, cell, cell);
        } else if (rng(r*grid+c) > 0.5) {
          ctx.fillRect(c*cell, r*cell, cell, cell);
        }
      }
    }
  }, [slotId, size]);
  return <canvas ref={ref} width={size} height={size} className="rounded" />;
}

// ─── Slot ─────────────────────────────────────────────────────────────────────
function Slot({ id, data, onClick, dimmed }) {
  const s   = TIPOS[data?.tipo] || TIPOS.empty;
  const occ = isOccupied(data);
  return (
    <button
      onClick={() => onClick(id)}
      title={id}
      className={`
        relative rounded-lg border transition-all duration-150
        hover:scale-105 hover:brightness-125 focus:outline-none focus:ring-1 focus:ring-white/20
        ${s.bg} ${s.border}
        w-[68px] h-[50px] flex flex-col items-start justify-center px-1.5 py-1
        ${dimmed ? "opacity-20" : "opacity-100"}
      `}
    >
      <span className="text-[9px] font-semibold text-gray-300 leading-none mb-0.5 truncate w-full">{id}</span>
      {occ ? (
        <>
          <span className={`text-[9px] font-medium ${s.text} leading-none truncate w-full`}>{data.part}</span>
          <span className="text-[9px] text-gray-400 leading-none mt-0.5">{data.qty} pzs</span>
        </>
      ) : (
        <span className="text-[9px] text-gray-600 leading-none">vacío</span>
      )}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ id, data, history, onClose, onSaveEntry, onSaveMove, onClear }) {
  const [tab,  setTab]  = useState("info");
  const [form, setForm] = useState({ part:"", qty:"", desc:"", wo:"", tipo: data?.tipo || "magneto" });
  const [move, setMove] = useState({ type:"in", qty:"", resp:"", note:"" });

  const s    = TIPOS[data?.tipo] || TIPOS.empty;
  const occ  = isOccupied(data);
  const hist = history || [];

  function handleEntry(e) {
    e.preventDefault();
    if (!form.part || !form.qty) return alert("Ingresa número de parte y cantidad");
    onSaveEntry(id, { ...form, qty: parseInt(form.qty) });
    onClose();
  }
  function handleMove(e) {
    e.preventDefault();
    const qty = parseInt(move.qty);
    if (!qty) return alert("Ingresa la cantidad");
    if (move.type === "out" && qty > data.qty) return alert("Cantidad mayor al stock");
    onSaveMove(id, { ...move, qty });
    onClose();
  }

  const tabs = [{ key:"info", label:"Información" }, { key:"move", label:"Entrada / Salida" }, { key:"qr", label:"QR" }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-[420px] max-w-[96vw] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${s.badge}`}>
              {TIPOS[data?.tipo]?.label || "—"}
            </span>
            <h3 className="text-white font-semibold">{id}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 px-5 pt-4">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${tab === t.key ? "bg-gray-700 text-white border-gray-600" : "text-gray-400 border-transparent hover:text-gray-200"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-4 max-h-[65vh] overflow-y-auto">

          {/* INFO vacío */}
          {tab === "info" && !occ && (
            <form onSubmit={handleEntry} className="flex flex-col gap-3">
              <p className="text-gray-500 text-sm text-center py-1">Espacio vacío — registra una entrada</p>
              {[
                { label:"Número de parte", key:"part", placeholder:"Ej. MAG-550",       type:"text"   },
                { label:"Cantidad",        key:"qty",  placeholder:"0",                  type:"number" },
                { label:"Descripción",     key:"desc", placeholder:"Motivo / falla",     type:"text"   },
                { label:"Orden WO",        key:"wo",   placeholder:"WO-2024-XXX",        type:"text"   },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tipo de material</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500">
                  <option value="magneto">Magneto</option>
                  <option value="housing">Housing</option>
                  <option value="motores">Motores</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-sky-700 hover:bg-sky-600 text-white rounded-lg py-2 text-sm font-medium transition-colors mt-1">
                Registrar entrada
              </button>
            </form>
          )}

          {/* INFO ocupado */}
          {tab === "info" && occ && (
            <>
              <table className="w-full text-sm mb-4">
                <tbody>
                  {[
                    ["Parte",        data.part],
                    ["Cantidad",     `${data.qty} pzs`],
                    ["Tipo",         TIPOS[data.tipo]?.label],
                    ["Descripción",  data.desc  || "—"],
                    ["Orden WO",     data.wo    || "—"],
                    ["Fecha",        data.fecha || "—"],
                  ].map(([label, value], i) => (
                    <tr key={i} className="border-b border-gray-800 last:border-0">
                      <td className="text-gray-400 py-2 pr-4 text-xs">{label}</td>
                      <td className="text-right py-2 font-medium text-gray-200 text-xs">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mb-2">Movimientos</p>
              <div className="flex flex-col mb-4">
                {hist.slice(-5).reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1.5 border-b border-gray-800 last:border-0">
                    <span className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${h.type === "in" ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="text-gray-300 flex-1">{h.text}</span>
                    <span className="text-gray-500 whitespace-nowrap ml-2">{h.time}</span>
                  </div>
                ))}
                {hist.length === 0 && <p className="text-gray-600 text-xs">Sin movimientos</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (window.confirm(`¿Vaciar ${id}?`)) { onClear(id); onClose(); } }}
                  className="flex-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg py-2 text-xs transition-colors">
                  Vaciar espacio
                </button>
                <button onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg py-2 text-xs transition-colors">
                  Cerrar
                </button>
              </div>
            </>
          )}

          {/* ENTRADA / SALIDA */}
          {tab === "move" && (
            <form onSubmit={handleMove} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tipo de movimiento</label>
                <select value={move.type} onChange={(e) => setMove({ ...move, type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500">
                  <option value="in">Entrada / Reposición</option>
                  {occ && <option value="out">Salida</option>}
                </select>
              </div>
              {[
                { label:"Cantidad de piezas", key:"qty",  placeholder:"0",                     type:"number" },
                { label:"Responsable",        key:"resp", placeholder:"Nombre del operador",   type:"text"   },
                { label:"Nota (opcional)",    key:"note", placeholder:"Ej. Sale a reparación", type:"text"   },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <input type={type} value={move[key]} onChange={(e) => setMove({ ...move, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500" />
                </div>
              ))}
              <button type="submit" className="w-full bg-sky-700 hover:bg-sky-600 text-white rounded-lg py-2 text-sm font-medium transition-colors mt-1">
                Registrar movimiento
              </button>
            </form>
          )}

          {/* QR */}
          {tab === "qr" && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="bg-white p-3 rounded-xl">
                <QRCanvas slotId={id} size={140} />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">MRB — {id}</p>
                <p className="text-gray-400 text-xs">{data?.part || "Vacío"} · {TIPOS[data?.tipo]?.label}</p>
              </div>
              <p className="text-gray-500 text-xs text-center px-4">
                Pega este QR en el rack físico para registrar movimientos desde cualquier dispositivo
              </p>
              <button onClick={() => window.print()}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-5 py-2 text-sm transition-colors">
                Imprimir QR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function MRB() {
  const [rackData, setRackData] = useState(buildInitialData);
  const [history,  setHistory]  = useState(buildInitialHistory);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("all");

  // ── Estadísticas ──
  const allSlots = Object.values(rackData);
  const total    = allSlots.length;
  const occupied = allSlots.filter(isOccupied).length;
  const empty    = total - occupied;
  const byTipo   = (t) => allSlots.filter((s) => s.tipo === t && isOccupied(s)).length;

  // ── Handlers ──
  function addHistory(id, type, text) {
    setHistory((prev) => ({ ...prev, [id]: [...(prev[id] || []), { type, text, time: nowLabel() }] }));
  }
  function handleSaveEntry(id, form) {
    setRackData((prev) => ({
      ...prev,
      [id]: { tipo: form.tipo, part: form.part, qty: form.qty, desc: form.desc, wo: form.wo, fecha: new Date().toLocaleDateString("es-MX") },
    }));
    addHistory(id, "in", `Entrada: ${form.qty} pzs ${form.part}`);
  }
  function handleSaveMove(id, move) {
    setRackData((prev) => {
      const d = { ...prev[id] };
      if (move.type === "out") {
        d.qty -= move.qty;
        if (d.qty <= 0) { d.part = ""; d.qty = 0; d.wo = ""; d.desc = ""; d.fecha = ""; }
      } else {
        d.qty = (d.qty || 0) + move.qty;
      }
      return { ...prev, [id]: d };
    });
    const note = move.note ? ` — ${move.note}` : "";
    const resp = move.resp ? ` (${move.resp})` : "";
    addHistory(id, move.type, move.type === "in" ? `Entrada: ${move.qty} pzs${note}${resp}` : `Salida: ${move.qty} pzs${note}${resp}`);
  }
  function handleClear(id) {
    const d = rackData[id];
    addHistory(id, "out", `Vaciado: ${d.part}, ${d.qty} pzs`);
    setRackData((prev) => ({ ...prev, [id]: { ...prev[id], part: "", qty: 0, wo: "", desc: "", fecha: "" } }));
  }

  function isDimmed(data) {
    if (filter === "all") return false;
    if (filter === "empty") return isOccupied(data);
    return data.tipo !== filter || !isOccupied(data);
  }

  // ── Rack vertical (A o C): filas de arriba→abajo = fila mayor→menor ──
  function RackVertical({ rack, numFilas, numCols }) {
    const filasDesc = Array.from({ length: numFilas }, (_, i) => numFilas - i);
    const colsAsc   = Array.from({ length: numCols  }, (_, i) => i + 1);
    return (
      <div className="flex flex-col gap-0.5">
        <div className="text-[10px] font-bold text-gray-400 text-center mb-1 tracking-widest uppercase">
          Rack {rack}
        </div>
        {filasDesc.map((fila) => (
          <div key={fila} className="flex gap-0.5 items-center">
            <span className="text-[9px] text-gray-600 w-4 text-right flex-shrink-0 mr-0.5">{fila}</span>
            {colsAsc.map((col) => {
              const id = `${rack}.${fila}.${col}`;
              return (
                <Slot key={col} id={id} data={rackData[id]} onClick={setSelected} dimmed={isDimmed(rackData[id])} />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // ── Rack B horizontal: columnas 1→8, filas de arriba→abajo = fila mayor→menor ──
  function RackHorizontal({ rack, numCols, numFilas }) {
    const filasDesc = Array.from({ length: numFilas }, (_, i) => numFilas - i);
    const colsAsc   = Array.from({ length: numCols  }, (_, i) => i + 1);
    return (
      <div className="flex flex-col gap-0.5">
        <div className="text-[10px] font-bold text-gray-400 text-center mb-1 tracking-widest uppercase">
          Rack {rack}
        </div>
        {filasDesc.map((fila) => (
          <div key={fila} className="flex gap-0.5 items-center">
            <span className="text-[9px] text-gray-600 w-4 text-right flex-shrink-0 mr-0.5">{fila}</span>
            {colsAsc.map((col) => {
              const id = `${rack}.${col}.${fila}`;
              return (
                <Slot key={col} id={id} data={rackData[id]} onClick={setSelected} dimmed={isDimmed(rackData[id])} />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // ── Ancho de un rack vertical: 4px margen + 16px etiqueta fila + 3*(68+2)px slots ──
  const rackAWidth = 16 + 3 * 70; // ~226px

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Área MRB</h1>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full">
            En vivo
          </span>
        </div>
        {/* Filtros / leyenda */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key:"all",     label:"Todos"   },
            { key:"magneto", label:"Magneto" },
            { key:"housing", label:"Housing" },
            { key:"motores", label:"Motores" },
            { key:"empty",   label:"Vacíos"  },
          ].map(({ key, label }) => {
            const s = TIPOS[key] || TIPOS.empty;
            return (
              <button key={key} onClick={() => setFilter(filter === key ? "all" : key)}
                className={`text-xs px-3 py-1 rounded-lg border transition-all
                  ${filter === key
                    ? key === "all" ? "bg-white text-gray-900 border-white"
                    : `${s.badge}`
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {[
          { label:"Total",    value:total,            color:"text-white"        },
          { label:"Ocupados", value:occupied,          color:"text-sky-400"      },
          { label:"Vacíos",   value:empty,             color:"text-gray-400"     },
          { label:"Magneto",  value:byTipo("magneto"), color:"text-emerald-400"  },
          { label:"Housing",  value:byTipo("housing"), color:"text-sky-400"      },
          { label:"Motores",  value:byTipo("motores"), color:"text-orange-400"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800 rounded-xl p-3 border border-gray-700 text-center">
            <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Layout del área — U invertida */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex flex-col gap-3">

          {/* Rack B arriba — alineado sobre el espacio central (desplazado al ancho de Rack A) */}
          <div className="flex" style={{ paddingLeft: `${rackAWidth + 20}px` }}>
            <RackHorizontal rack="B" numCols={8} numFilas={3} />
          </div>

          {/* Fila central: A | área de trabajo | C */}
          <div className="flex items-start gap-5">
            <RackVertical rack="A" numFilas={8} numCols={3} />

            {/* Área central de trabajo */}
            <div className="flex items-center justify-center rounded-2xl border border-gray-700 bg-gray-800/40"
              style={{ width: "560px", height: `${8 * 52}px` }}>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-14 h-14 rounded-xl bg-gray-700/60 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-medium">Área de trabajo</p>
                <p className="text-gray-600 text-xs">7.5 m</p>
              </div>
            </div>

            <RackVertical rack="C" numFilas={8} numCols={3} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <Modal
          id={selected}
          data={rackData[selected]}
          history={history[selected]}
          onClose={() => setSelected(null)}
          onSaveEntry={handleSaveEntry}
          onSaveMove={handleSaveMove}
          onClear={handleClear}
        />
      )}
    </div>
  );
}