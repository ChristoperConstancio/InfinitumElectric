import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import editClient from '../customHooks/editClient';
import editingClient from '../customHooks/editingClient';
export default function ModificarCliente() {
    const navigate = useNavigate();
    const [oldRFC, setOldRFC] = useState()

    const [data, setData] = useState({
        Razonsocial : '',
        RFC: '',
        Direccion: '',
        Contacto: '',
        Correo: '',
        Telefono: ''
    })
    const cancelAction = (e) => {
        e.preventDefault();
        alert("Operacion Cancelada");
        navigate('/Clientes');
    }

    const upClient = async (e) => {
        e.preventDefault();
        const updateUser = await editingClient(oldRFC, data);
        if(!updateUser){
         alert("Actualizacion NO Exitosa")
        }else{
            alert("Actualizacion Exitosa!!")
            navigate('/Clientes')
        }
        
    }
    const handleInputChange = (e) => {
        const { name, value } = e.target;
            setData({
                ...data,
                [name]: value,// Actualiza el valor correspondiente en el objeto de estado
            });

    };

    useEffect(() => {

        const updateUser = async () => {
            const iden = localStorage.getItem('id');
            const { Razonsocial, RFC, Direccion, Contacto, Correo, Telefono, Status } = await editClient(iden);
            setOldRFC(RFC)
            setData({
                Razonsocial,
                RFC,
                Direccion,
                Contacto,
                Correo,
                Telefono
            })
        }
        updateUser();
    }, []);
    return (
        <div className='h-screen bg-black space-y-8 '>
            <h1 className='font-bold text-white text-3xl text-center'>Editar Cliente</h1>
            <form action="click">
                <div className='grid grid-rows-3 grid-cols-2 items-center justify-center  mx-20 gap-y-8 ' >

                    <div className='space-x-10 flex '>
                        <h1 className="text-white text-3xl">Razon Social: </h1>
                        <input type="text"
                            id='razonsocial'
                            name='Razonsocial'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3 placeholder-black'
                            value={data.Razonsocial}
                            onChange={handleInputChange}

                        />
                    </div>
                    <div className='space-x-5 flex  items-center'>
                        <h1 className="text-white text-3xl">RFC: </h1>

                        <input type="text"
                            id='rfc'
                            name='RFC'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3 placeholder-black'
                            value={data.RFC}
                            onChange={handleInputChange}
                            readOnly
                        />
                    </div>
                    <div className='space-x-5 flex  items-center'>
                        <h1 className="text-white text-3xl">Direccion: </h1>

                        <input type="text"
                            id='direccion'
                            name='Direccion'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3 placeholder-black'
                            value={data.Direccion}
                            onChange={handleInputChange}


                        />
                    </div>
                   
                    <div className='space-x-4 flex'>
                        <h1 className="text-white text-3xl">Contacto: </h1>

                        <input type="text"
                            id='contacto'
                            name='Contacto'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3 placeholder-black'
                            value={data.Contacto}
                            onChange={handleInputChange}


                        />
                    </div>
                    <div className='space-x-5 flex  items-center'>
                        <h1 className="text-white text-3xl">Correo : </h1>
                        <input type="text"
                            id='correo'
                            name='Correo'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3 placeholder-black'
                            value={data.Correo}
                            onChange={handleInputChange}


                        />
                    </div>
                    <div className='space-x-5 flex  items-center'>
                        <h1 className="text-white text-3xl">Telefono : </h1>
                        <input type="number"
                            id='telefono'
                            name='Telefono'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3 placeholder-black'
                            value={data.Telefono}
                            onChange={handleInputChange}


                        />
                    </div>
                </div>

                <div className="my-10 flex justify-center mx-44 space-x-16" >
                    <button className="bg-red-500 rounded-xl text-white font-bold w-44"
                        onClick={cancelAction}>
                        Cancelar
                    </button>
                    <button
                        className="bg-amber-500 rounded-xl text-white font-bold w-44 h-16"
                        onClick={upClient}
                    >
                        Guardar
                    </button>
                </div>
            </form>

        </div>
    )
}
