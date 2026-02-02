import React, { useEffect, useState } from 'react'
import getClientes from '../../customHooks/getClients'
import {fetchRFQ, addRFQs, checkRFQ} from '../../customHooks/RFQ'
import { useNavigate } from 'react-router-dom'

function AgregarRFQ() {
    const [optionsCustomer, setOptionsCustomer] = useState([]);
    const [type, setType] = useState("pieza")
    const pieza = document.getElementById("pieza");
    const servicio = document.getElementById("servicio");
    const razon = document.getElementById("rsocial");

    const navigate = useNavigate();
    const cancel = (e) => {
        e.preventDefault();
        alert("Operacion Cancelada");
        navigate('/RFQ');
    }
  
    const addRFQ = async (e) => {
        const numeroAleatorio = Math.floor(Math.random() * 100000);
        const idRFQ = razon.value.substring(0,4) + numeroAleatorio ;
        const checked = await checkRFQ(idRFQ);
        if(!checked){
            alert("volver a intentar");
            return false;
        }
        
        localStorage.setItem('idRFQ', idRFQ)
        if(servicio.value == "default" || pieza.value == "default" || razon.value == "default"){
            alert("Hay campos sin llenar");
            return false;
        }
        
        const isSelected = prompt(`Escribe "OK" para confirmar el RFQ de tipo ${type}`)
        const todayDate = new Date();
        if(isSelected == "OK" || isSelected == 'ok'){
            if( servicio.value == "true"  ){
                const docRFQ = {
                    Id_rfq : idRFQ,
                    RFC : razon.value,
                    Total : 0,
                    esMant : true,
                    esPz : false,
                    state : 'Activo',
                    fecha : todayDate
                }
                const isSuccesful = await addRFQs(docRFQ);
                if(isSuccesful){
                    alert("RFQ Creado")
                    navigate("/RFQServicio")
    
                }else{
                    alert("Error")
                }
            }else{
                const docRFQ = {
                    Id_rfq : idRFQ,
                    RFC : razon.value,
                    Total: 0,
                    esMant : false,
                    esPz : true,
                    state : 'Activo',
                    fecha : todayDate
                }
                const isSuccesful = await addRFQs(docRFQ);
                
                if(isSuccesful){
                    alert("RFQ Creado")
                    navigate("/RFQPiezas")
                }else{
                    alert("Error")
                }
            }
        }else{
            alert("Escribe ok para guardar")
        }
        
    }
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        if((name == "pieza" && value == "false")  ){
            servicio.value =  "true";
            setType("servicio");
            return;
        }if(name == "servicio" && value == "false" ){
            pieza.value = "true";
            setType("pieza")
            return;
        }
        if(name == "pieza" && value == "true"){
            servicio.value = "false"
            setType("pieza");
            return;
        }
        if(name == "servicio" && value == "true"){
            pieza.value = "false"
            setType("servicio");
            return;
        }
       
    }
    useEffect(() => {
        const getCustomers  = async () => {
            const customers = await getClientes();
            setOptionsCustomer(customers)
        }
        getCustomers();
    }, [])
    return (
        <div className='h-screen bg-black mx-auto text-center space-y-32 '>
            <div className='space-y-8'>
            <h1 className='text-4xl text-white font-bold'>Agregar RFQ</h1>
            <h2 className='text-white text-xl'>Selecciona que tipo de RFQ se registra</h2>
            <div className='flex justify-center items-center space-x-8 '>
                <label className='text-white text-3xl'>Piezas: </label>
                <select name="pieza" id="pieza" className='w-52 rounded-md'
                        onClick={handleSelectChange}>
                    <option value="true">Si</option>
                    <option value="false">No</option>
                </select>
            </div>
            <div className='flex justify-center items-center space-x-8 '>
                <label className='text-white text-3xl'>Servicio: </label>
                <select name="servicio" id="servicio" className='w-52 rounded-md'
                onClick={handleSelectChange}>
                    <option value="false">No</option>
                    <option value="true">Si</option>
                </select>
            </div>
             <div className='flex justify-center items-center space-x-8 '>
                <label className='text-white text-3xl'>Razon Social: </label>
                <select               
                            id='rsocial'
                            className=" rounded-lg  h-7 w-52"
                        >
                            <option value="default">Selecciona una opción</option>

                            { optionsCustomer ? optionsCustomer.map((item, index) => (
                                <option key={index} value={item.RFC}>
                                    {item.Razonsocial}
                                </option>
                            )) : <h1  className='text-white'> No se encontraron clientes</h1>}
                        </select>
            </div>
            
            </div>
            
            <div className="my-10 flex justify-center mx-44 space-x-16">
                    <button className="bg-red-500 rounded-xl text-white font-bold w-44 h-16"
                        onClick={cancel}
                    >
                        <h1 className="text-3xl" > Cancelar </h1>

                    </button>
                    <button
                        className="bg-amber-500 rounded-xl text-white font-bold w-44 h-16"
                        onClick={addRFQ}
                    >
                        <h1 className="text-3xl" > Guardar </h1>
                    </button>
                </div>
        </div>
    )
}

export default AgregarRFQ