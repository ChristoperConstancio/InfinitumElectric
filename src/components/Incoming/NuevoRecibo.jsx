import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { guardarRecibo, getReciboById, updateRecibo } from "../../customHooks/RFQ";

function NuevoRecibo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    partNo: "",
    rev: "",
    um: "",
    packingList: "",
    po: "",
    plexDate: "",
    qty: "",
    serialPlex: "",
    shipperNo: "",
    diasDif: "",
    supplier: "",
    materialista: "",
    numeroRecibo: "",
    idTrailer: "",
    invoice: "",
    invoiceDate: "",
    arrivalDate: "",
    costUnit: "",
    comentarios: "",
    status: "pendiente",
    tipoMaterial: "materia_prima",
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
    if (!form.arrivalDate || !form.plexDate) return "";
    const diff = new Date(form.arrivalDate) - new Date(form.plexDate);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();

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

        <input name="numeroRecibo" value={form.numeroRecibo} onChange={handleChange} placeholder="Número de recibo" className="bg-gray-800 p-2 rounded" />
        <input name="invoice" value={form.invoice} onChange={handleChange} placeholder="Numero factura" className="bg-gray-800 p-2 rounded" />

        <div>
          <label className="block text-sm mb-1">Fecha de factura</label>
          <input
            type="date"
            name="invoiceDate"
            value={form.invoiceDate}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha de llegada</label>
          <input
            type="date"
            name="arrivalDate"
            value={form.arrivalDate}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>
        <input name="idTrailer" value={form.idTrailer} onChange={handleChange} placeholder="ID Trailer" className="bg-gray-800 p-2 rounded" />
        <input name="packingList" value={form.packingList} onChange={handleChange} placeholder="Packing List" className="bg-gray-800 p-2 rounded" />

        <input name="partNo" value={form.partNo} onChange={handleChange} placeholder="Part No" className="bg-gray-800 p-2 rounded" />
        <input name="rev" value={form.rev} onChange={handleChange} placeholder="Rev" className="bg-gray-800 p-2 rounded" />

        <input name="um" value={form.um} onChange={handleChange} placeholder="U/M" className="bg-gray-800 p-2 rounded" />

        <input type="number" name="qtyInvoice" value={form.qtyInvoice} onChange={handleChange} placeholder="Qty Factura" className="bg-gray-800 p-2 rounded" />
        <input type="number" name="qtyFisica" value={form.qtyFisica} onChange={handleChange} placeholder="Qty Física" className="bg-gray-800 p-2 rounded" />

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            $
          </span>
          <input
            type="number"
            name="costUnit"
            value={form.costUnit}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full bg-gray-800 border border-gray-600 p-2 pl-8 rounded"
            placeholder="0.00"
          />
        </div>        <input name="po" value={form.po} onChange={handleChange} placeholder="PO" className="bg-gray-800 p-2 rounded" />

        <input name="shipperNo" value={form.shipperNo} onChange={handleChange} placeholder="Shipper No" className="bg-gray-800 p-2 rounded" />
        <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier" className="bg-gray-800 p-2 rounded" />

        {/* Fecha recibo PLEX */}
        <div>
          <label className="block text-sm mb-1">Fecha recibo PLEX</label>
          <input
            type="date"
            name="plexDate"
            value={form.plexDate}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>        <input name="serialPlex" value={form.serialPlex} onChange={handleChange} placeholder="Serial Plex" className="bg-gray-800 p-2 rounded" />

        <input name="comentarios" value={form.comentarios} onChange={handleChange} placeholder="Comentarios" className="bg-gray-800 p-2 rounded" />

        <input value={diasDiferencia} readOnly placeholder="Dias diferencia" className="bg-gray-700 p-2 rounded" />

        {/* STATUS */}
        <select name="status" value={form.status} onChange={handleChange} className="bg-gray-800 p-2 rounded">
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="capturado">Capturado</option>
          <option value="transferencia">Transferencia</option>
        </select>

        {/* TIPO MATERIAL */}
        <select name="tipoMaterial" value={form.tipoMaterial} onChange={handleChange} className="bg-gray-800 p-2 rounded">
          <option value="materia_prima">Materia Prima Temporal</option>
          <option value="materia_prima_definitiva">Materia Prima Definitiva</option>
        </select>

        <input value={form.materialista} readOnly className="bg-gray-700 p-2 rounded col-span-2" />

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