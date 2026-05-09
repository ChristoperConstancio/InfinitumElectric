import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { guardarRecibo, getReciboById, updateRecibo } from "../../customHooks/RFQ";

function NuevoRecibo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    numeroRecibo: "",
    invoice: "",
    invoiceDate: "",
    arrivalDate: "",
    idTrailer: "",
    packingList: "",
    partNo: "",
    rev: "",
    um: "",
    qtyInvoice: "",
    qtyFisica: "",
    costUnit: "",
    po: "",
    shipperNo: "",
    supplier: "",
    plexDate: "",
    serialPlex: "",
    comentarios: "",
    diasDif: "",
    status: "pendiente",
    tipoMaterial: "materia_prima",
    confirmacion: "",
    statusRecibo: "",      // ✅
    discrepancia: "",      // ✅
    recibe: "",
    materialista: "",
  });
  // 🔥 Materialista (solo en creación)
  useEffect(() => {
    if (!isEdit) {
      const nombre = localStorage.getItem("username");
      if (nombre) {
        setForm(prev => ({ ...prev, materialista: nombre }));
      }
    }
  }, [isEdit]);

  // 🔥 Cargar datos en edición
  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        const data = await getReciboById(id);
        if (data) setForm(data);
      };
      fetchData();
    }
  }, [id, isEdit]);

  const getMonthString = () => {
    const fecha = new Date();
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril",
      "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${meses[fecha.getMonth()]}-${fecha.getFullYear()}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const diasDiferencia = (() => {
    if (!form.invoiceDate || !form.plexDate) return "";
    const diff = new Date(form.plexDate) - new Date(form.invoiceDate);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("es" + id)
    let response;

    if (isEdit) {
      // 🔥 UPDATE
      response = await updateRecibo(id, {
        ...form,
        qty: Number(form.qty)
      });
    } else {
      // 🔥 CREATE
      response = await guardarRecibo({
        ...form,
        qty: Number(form.qty),
        createdAt: new Date().toLocaleString("es-MX"),
        Month: getMonthString()
      });
    }

    if (response.ok) {
      navigate("/recibo");
    } else {
      console.error("❌ Error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">

      {/* Header */}
      <div className="px-12 py-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Editar Recibo" : "Nuevo Recibo"}
        </h1>
        <p className="text-gray-400">Captura de material</p>
      </div>

      <form onSubmit={handleSubmit} className="px-12 py-6 grid grid-cols-2 gap-6">

        <div>
          <label className="block text-sm mb-1">Número de recibo</label>
          <input name="numeroRecibo" value={form.numeroRecibo} onChange={handleChange} placeholder="Número de recibo" className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Numero factura</label>
          <input name="invoice" value={form.invoice} onChange={handleChange} placeholder="Numero factura" className="w-full bg-gray-800 p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm mb-1">Fecha de factura</label>
          <input type="date" name="invoiceDate" value={form.invoiceDate} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha de llegada</label>
          <input type="date" name="arrivalDate" value={form.arrivalDate} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm mb-1">ID Trailer</label>
          <input name="idTrailer" value={form.idTrailer} onChange={handleChange} placeholder="ID Trailer" className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Packing List</label>
          <input name="packingList" value={form.packingList} onChange={handleChange} placeholder="Packing List" className="w-full bg-gray-800 p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm mb-1">Part No</label>
          <input name="partNo" value={form.partNo} onChange={handleChange} placeholder="Part No" className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Rev</label>
          <input name="rev" value={form.rev} onChange={handleChange} placeholder="Rev" className="w-full bg-gray-800 p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm mb-1">U/M</label>
          <input name="um" value={form.um} onChange={handleChange} placeholder="U/M" className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Qty Factura</label>
          <input type="number" name="qtyInvoice" value={form.qtyInvoice} onChange={handleChange} placeholder="Qty Factura" className="w-full bg-gray-800 p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm mb-1">Qty Física</label>
          <input type="number" name="qtyFisica" value={form.qtyFisica} onChange={handleChange} placeholder="Qty Física" className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Costo Unitario</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input type="number" name="costUnit" value={form.costUnit} onChange={handleChange} step="0.01" min="0" className="w-full bg-gray-800 border border-gray-600 p-2 pl-8 rounded" placeholder="0.00" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">PO</label>
          <input name="po" value={form.po} onChange={handleChange} placeholder="PO" className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Shipper No</label>
          <input name="shipperNo" value={form.shipperNo} onChange={handleChange} placeholder="Shipper No" className="w-full bg-gray-800 p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm mb-1">Supplier</label>
          <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier" className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha recibo PLEX</label>
          <input type="date" name="plexDate" value={form.plexDate} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm mb-1">Serial Plex</label>
          <input name="serialPlex" value={form.serialPlex} onChange={handleChange} placeholder="Serial Plex" className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Comentarios</label>
          <input name="comentarios" value={form.comentarios} onChange={handleChange} placeholder="Comentarios" className="w-full bg-gray-800 p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm mb-1">Dias diferencia</label>
          <input value={diasDiferencia} readOnly placeholder="Dias diferencia" className="w-full bg-gray-700 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full bg-gray-800 p-2 rounded">
            <option value="pendiente">Pendiente</option>
            <option value="completado">Completado</option>
            <option value="capturado">Capturado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tipo Material</label>
          <select name="tipoMaterial" value={form.tipoMaterial} onChange={handleChange} className="w-full bg-gray-800 p-2 rounded">
            <option value="materia_prima">Materia Prima Temporal</option>
            <option value="materia_prima_definitiva">Materia Prima Definitiva</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Confirmación</label>
          <select name="confirmacion" value={form.confirmacion} onChange={handleChange} className="w-full bg-gray-800 p-2 rounded">
            <option value="">-- Confirmación --</option>
            <option value="confirmado">Confirmado</option>
            <option value="confirmadoDiscrepancia">Confirmado con Discrepancia</option>
            <option value="confirmadoPendPO">Confirmado con Pend. de PO</option>
            <option value="noConfirmado">No Confirmado</option>
          </select>
        </div>

        {/* ✅ NUEVO - Status Recibo */}
        <div>
          <label className="block text-sm mb-1">Status Recibo</label>
          <select name="statusRecibo" value={form.statusRecibo} onChange={handleChange} className="w-full bg-gray-800 p-2 rounded">
            <option value="">-- Status Recibo --</option>
            <option value="plex">Plex</option>
            <option value="transferencia">Transferencia</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>

        {/* ✅ NUEVO - Discrepancia */}
        <div>
          <label className="block text-sm mb-1">Discrepancia</label>
          <select name="discrepancia" value={form.discrepancia} onChange={handleChange} className="w-full bg-gray-800 p-2 rounded">
            <option value="">-- Discrepancia --</option>
            <option value="discrepancia">Discrepancia</option>
            <option value="pendiente">Pendiente</option>
            <option value="sinAccionPendiente">Sin Acción Pendiente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Persona que recibe</label>
          <input value={form.recibe} name="recibe" placeholder="Persona que recibe" onChange={handleChange} className="w-full bg-gray-800 p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Materialista</label>
          <input value={form.materialista} readOnly className="w-full bg-gray-700 p-2 rounded" />
        </div>

        {/* BOTONES */}
        <div className="col-span-2 flex justify-end space-x-4">
          <button type="button" onClick={() => navigate("/recibo")} className="bg-gray-600 px-4 py-2 rounded">
            Cancelar
          </button>
          <button type="submit" className="bg-green-500 px-4 py-2 rounded">
            {isEdit ? "Actualizar" : "Guardar"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default NuevoRecibo;