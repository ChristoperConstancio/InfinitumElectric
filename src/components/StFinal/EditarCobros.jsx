import React, { useEffect, useState } from 'react'
import { editarCobros, fetchCobro } from '../../customHooks/Cobros';
import { useNavigate } from 'react-router-dom';

function EditarCobros() {
    const [data, setData] = useState("");
    const [disponible, setDisponible] = useState(false)
    const navigate =  useNavigate();
    const salvar = async () => {
        const x = document.getElementById('monto').value;
        const confirmar = document.getElementById('confirmar').value;
        if (x !== confirmar || x == '') {
            alert("Montos no coinciden o vacios")
            return;
        }
        if(data.total < confirmar){
            alert("el monto es mayor al total");
            return;
        }
        
        const date = document.getElementById('fecha').value;
        const nuCobro = document.getElementById('nuCobro').value;
        const nuVenta = document.getElementById('nuVenta').value;
        const rastreo = document.getElementById('rastreo').value;
        setData({ ...data, fecha: date, nuVenta, nuCobro, rastreo })
        setDisponible(true);
        alert("Ahora puedes hacer el cobro por $" + x)
    }
    const handleInputChange = () => {
        const x = document.getElementById('monto').value;
        const confirmar = document.getElementById('confirmar').value;
        

        if (x == confirmar) {
            const cantidad = parseInt(data.total) - parseInt(x);
            setData({ ...data, monto: x, saldo: cantidad })
        }
    }
    const editCobro = async () => {
        const x = document.getElementById('monto').value;
        const confirmar = document.getElementById('confirmar').value;
        const saldo = document.getElementById('saldo').value;

        if (x !== confirmar || x == '') {
            alert("Montos no coinciden o vacios")
            return;
        }
        if(data.total < confirmar){
            alert("el monto es mayor al total");
            return;
        }
        if (!disponible) {
            alert("debes salvarlo primero");
            return;
        }
        const isSucc = await editarCobros(data);
        if (!isSucc) {
            alert("ocurrio un problema con el servidor");
            return false;
        }
        alert("Editado exitoso")
        navigate('/Cobros')
    }
    const cancel = (e) => {
        e.preventDefault();
        alert("Operacion Cancelada");
        navigate('/CobrosView');
    }
    useEffect(() => {
      
        const getCobro = async () => {
            const cobro = localStorage.getItem('nuCobro');
            const datos = await fetchCobro(cobro);
            document.getElementById('saldo').value = datos.saldo;
            setData(datos);
        }
        const setFecha = () => {
            // Obtén la fecha actual
            const fechaActual = new Date();

            // Obtiene el año, mes y día
            const año = fechaActual.getFullYear();
            const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Suma 1 al mes, ya que los meses van de 0 a 11
            const dia = fechaActual.getDate().toString().padStart(2, '0');

            // Formatea la fecha en el formato deseado
            const fechaFormateada = `${año}-${mes}-${dia}`;
            document.getElementById('fecha').value = fechaFormateada;
        }
        setFecha();
        getCobro();
    }, [])
    
    return (
        <div className='h-screen bg-black'>
            <div className='mx-20 py-10 grid grid-cols-2 gap-y-8 gap-x-8   ' id='add'>

                <div className='space-x-8 '>
                    <label htmlFor="" className='text-white text-3xl'>ID Pago :</label>
                    <input value={data.nuCobro} id='nuCobro' className='bg-slate-300 pl-3 rounded-lg w-72 h-10' type="text" readOnly />
                </div>
                <div className='space-x-8 '>
                    <label htmlFor="" className='text-white text-3xl'>Saldo :</label>
                    <input  id='saldo' className='pl-3 rounded-lg w-72 h-10'  type="number" readOnly />
                </div>
                <div className='space-x-8 '>
                    <label htmlFor="" className='text-white text-3xl'>N° Venta :</label>
                    <input value={data.nuVenta} id='nuVenta' className='bg-slate-300  pl-3 rounded-lg w-72 h-10' type="text" readOnly />
                </div>

                <div className='space-x-8 '>
                    <label htmlFor="" className='text-white text-3xl'>Tipo de Pago :</label>
                    <input value={data.tipoPago} id='tipo' className='bg-slate-300  pl-3 rounded-lg w-72 h-10' type="text" readOnly />

                </div>
                <div className='space-x-8 '>
                    <label htmlFor="" className='text-white text-3xl'>Fecha de Pago :</label>
                    <input  id='fecha' className=' bg-slate-300 pl-3 rounded-lg w-72 h-10' type="text" readOnly />
                </div>
                <div className='space-x-8 '>
                    <label htmlFor="" className='text-white text-3xl'>Clave de rastreo :</label>
                    <input className='pl-3 rounded-lg w-72 h-10' type="text" value={data.rastreo} id='rastreo'/>
                </div>
                <div className='space-x-8 '>
                    <label htmlFor="" className='text-white text-3xl'>Monto :</label>
                    <input placeholder={data.monto} id='monto' className='pl-3 rounded-lg w-72 h-10' type="number" onChange={handleInputChange} />
                </div>
                <div className='space-x-8 '>
                    <label htmlFor="" className='text-white text-3xl'>Confirmar monto :</label>
                    <input placeholder={data.monto} id='confirmar' className='pl-3 rounded-lg w-72 h-10' type="number" onChange={handleInputChange}/>
                </div>
                <button
                    onClick={salvar}
                    className="bg-green-500 hover:bg-green-800  rounded-xl text-white font-bold w-44 h-16"

                >
                    <h1 className="text-3xl" > Salvar </h1>
                </button>
            </div>
            <div className=" flex justify-center px-44 space-x-16 pt-5">
                <button className="bg-red-500 hover:bg-red-800 rounded-xl text-white font-bold w-44 h-16"
                    onClick={cancel}
                    >
                    <h1 className="text-3xl" > Cancelar </h1>
                </button>
                <button
                    onClick={editCobro}
                    className="bg-amber-500 hover:bg-amber-800  rounded-xl text-white font-bold w-44 h-16"

                >
                    <h1 className="text-3xl" > Guardar </h1>
                </button>
            </div>
        </div>
    )
}

export default EditarCobros