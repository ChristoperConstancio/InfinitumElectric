import { useState } from "react";
import { addJob } from "../../customHooks/RFQ";
import AlertMessage from "../Alertas/AlertMessage";

function AltaJob() {
    const [alert, setAlert] = useState(null);

    const [form, setForm] = useState({
        JOB: "",
        SKU: "",
        VFD: "",
        Rotor: "",
        Motor: "",
        Cantidad: "",
        Status: "Abierta"
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        const now = new Date();
        const fechaHoraMX = now.toLocaleString("es-MX", {
            timeZone: "America/Mexico_City",
            hour12: false
        });
        const payload = {
            ...form,
            Cantidad: Number(form.Cantidad),
            fechaAlta: fechaHoraMX,
            liberados: 0,
        };

        const ok = await addJob(form.JOB,payload);
        console.log(addJob)
        if (ok) {
            setAlert({
                type: "success",
                message: "JOB creada correctamente",
            });
            setForm({
                JOB: "",
                SKU: "",
                VFD: "",
                Rotor: "",
                Motor: "",
                Cantidad: "",
            });
        } else {
            setAlert({
                type: "error",
                message: "JOB ya capturada!",
            });
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 text-white">
            {alert && (
                <AlertMessage
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <form
                onSubmit={handleGuardar}
                className="bg-gray-900 p-8 rounded-xl border border-blue-400 shadow-xl space-y-4"
            >
                <h2 className="text-2xl font-bold text-whitetext-center">
                    Alta de JOB
                </h2>

                <input
                    required
                    name="JOB"
                    value={form.JOB}
                    placeholder="JOB"
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800"
                />

                <input
                    required
                    value={form.SKU}
                    name="SKU"
                    placeholder="SKU"
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800"
                />

                <input
                    required
                    name="VFD"
                    value={form.VFD}
                    placeholder="Número de parte VFD"
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800"
                />

                <input
                    required
                    name="Rotor"
                    value={form.Rotor}
                    placeholder="Número de parte Rotor"
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800"
                />

                <input
                    required
                    name="Motor"
                    value={form.Motor}
                    placeholder="Número de parte Motor"
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800"
                />

                <input
                    required
                    type="number"
                    min="1"
                    name="Cantidad"
                    value={form.Cantidad}
                    placeholder="Cantidad total de la JOB"
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-800"
                />

                <button
                    type="submit"
                    className="w-full bg-green-500 text-black font-semibold py-2 rounded-lg hover:bg-green-600 transition"
                >
                    Guardar JOB
                </button>
            </form>
        </div>
    );
}

export default AltaJob;
