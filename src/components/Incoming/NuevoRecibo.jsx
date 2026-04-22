import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { guardarRecibo } from "../../customHooks/RFQ";

function NuevoRecibo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    partNo: "",
    rev: "",
    um: "",
    packingList: "",
    po: "",
    plexDate: "",
    qty: "",
    serialPlex: "",
    supplier: "",
    materialista: "",
    numeroRecibo: "",
    idTrailer: "",
    invoice: "",
    invoiceDate: "",
    arrivalDate: "",
    costUnit: "",
    comentarios: "",
    status: "Recibido",
  });

  // 🔥 Traer materialista desde localStorage
  useEffect(() => {
    const nombre = localStorage.getItem("username"); // 👈 asegúrate del key
    if (nombre) {
      setForm(prev => ({
        ...prev,
        materialista: nombre
      }));
    }
  }, []);

  const getMonthString = () => {
    const fecha = new Date()

    const meses = [
      "Enero", "Febrero", "Marzo", "Abril",
      "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    const mes = meses[fecha.getMonth()]
    const year = fecha.getFullYear()

    return `${mes}-${year}`
  }
  // 🔹 Manejo de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };
const diasDiferencia = (() => {
  if (!form.arrivalDate || !form.plexDate) return "";

  const llegada = new Date(form.arrivalDate);
  const plex = new Date(form.plexDate);

  const diffTime = llegada - plex;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
})();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();

    const dataToSave = {
      ...form,
      qty: Number(form.qty),

      // 🔥 fecha automática desde el componente
      createdAt: now.toLocaleString("es-MX"),
      Month: getMonthString()
    };

    const response = await guardarRecibo(dataToSave);

    if (response.ok) {
      console.log("✅ Guardado");
      navigate("/recibo");
    } else {
      console.error("❌ Error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">

      {/* Header */}
      <div className="px-12 py-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold">Nuevo Recibo</h1>
        <p className="text-gray-400">Captura de material</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="px-12 py-6 grid grid-cols-2 gap-6">
        {/* Numero de recibo */}
        <div>
          <label className="block text-sm mb-1">Numero de recibo</label>
          <input
            type="text"
            name="numeroRecibo"
            value={form.numeroRecibo}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Invoice</label>
          <input
            type="text"
            name="invoice"
            value={form.invoice}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>

        {/*  Invoice Date*/}
        <div>
          <label className="block text-sm mb-1">Fecha de factura</label>
          <input
            type="date"
            name="invoiceDate"
            value={form.invoiceDate}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>
        {/* JTSD Trailer */}

        <div>
          <label className="block text-sm mb-1">Fecha de llegada</label>
          <input
            type="date"
            name="arrivalDate"
            value={form.arrivalDate}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Fecha de recibo PLEX</label>
          <input
            type="date"
            name="plexDate"
            value={form.plexDate}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Días de diferencia</label>
          <input
            type="text"
            value={diasDiferencia}
            readOnly
            className="w-full bg-gray-700 border border-gray-600 p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">ID Trailer</label>
          <input
            type="text"
            name="idTrailer"
            value={form.idTrailer}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>
        {/* Packing List */}
        <div>
          <label className="block text-sm mb-1">Packing List</label>
          <input
            type="text"
            name="packingList"
            value={form.packingList}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>
        {/* Part Number */}
        <div>
          <label className="block text-sm mb-1">Part Number</label>
          <input
            type="text"
            name="partNo"
            value={form.partNo}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>

        {/* Rev */}
        <div>
          <label className="block text-sm mb-1">Rev</label>
          <input
            type="text"
            name="rev"
            value={form.rev}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>

        {/* U/M */}
        <div>
          <label className="block text-sm mb-1">U/M</label>
          <input
            type="text"
            name="um"
            value={form.um}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>
        {/* Cantidad */}
        <div>
          <label className="block text-sm mb-1">Cantidad Factura</label>
          <input
            type="number"
            name="qtyInvoice"
            value={form.qtyInvoice}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm mb-1">Cantidad Fisica</label>
          <input
            type="number"
            name="qtyFisica"
            value={form.qtyFisica}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>
        {/* Cost Unit */}
        <div>
          <label className="block text-sm mb-1">Cost Unit</label>
          <input
            type="text"
            name="costUnit"
            value={form.costUnit}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>
        {/* PO */}
        <div>
          <label className="block text-sm mb-1">PO</label>
          <input
            type="text"
            name="po"
            value={form.po}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>



        {/* Serial Plex */}
        <div>
          <label className="block text-sm mb-1">Serial Plex</label>
          <input
            type="text"
            name="serialPlex"
            value={form.serialPlex}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
            required
          />
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-sm mb-1">Supplier</label>
          <input
            type="text"
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>


        {/*   invoice */}


        {/* Arrival Date */}

        {/* Packing list */}
        <div>
          <label className="block text-sm mb-1">Packing List</label>
          <input
            type="text"
            name="packingList"
            value={form.packingList}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>

        {/* Comentarios */}
        <div>
          <label className="block text-sm mb-1">Comentarios</label>
          <input
            type="text"
            name="comentarios"
            value={form.comentarios}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 p-2 rounded"
          />
        </div>

        {/* Materialista (solo lectura) */}
        <div className="col-span-2">
          <label className="block text-sm mb-1">Materialista</label>
          <input
            type="text"
            value={form.materialista}
            readOnly
            className="w-full bg-gray-700 border border-gray-600 p-2 rounded"
          />
        </div>

        {/* Botones */}
        <div className="col-span-2 flex justify-end space-x-4 mt-4">
          <button
            type="button"
            onClick={() => navigate("/recibo")}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
          >
            Guardar
          </button>
        </div>

      </form>
    </div>
  );
}

export default NuevoRecibo;