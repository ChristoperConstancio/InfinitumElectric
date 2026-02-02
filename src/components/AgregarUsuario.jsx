import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import React, { useEffect, useState } from 'react'
import { fetchData } from "../customHooks/getRoles";
import { useNavigate } from "react-router-dom";
import { getRol } from "../customHooks/getRol";
import { checkUser } from "../customHooks/getDocs";
import { addUserDoc } from "../customHooks/editingUser";
import bcrypt from 'bcryptjs'
export default function AgregarUsuario() {

    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");
    const username = document.getElementById('username');
    const paterno = document.getElementById('paterno');
    const password = document.getElementById('password');
    const nombre = document.getElementById('nombre');
    const materno = document.getElementById('materno');

    const navigate = useNavigate();
    const cancel = (e) => {
        e.preventDefault();
        alert("Operacion Cancelada");
        navigate('/Usuarios');
    }
    const blurFunction = async () => {
        const userCheck = await checkUser(username.value);
        if (!userCheck) {
            alert("Intenta con otro Usuario")
            
            return false;
        }
    }
    const addUser = async (e) => {
        e.preventDefault();


        const { id } = await getRol(selectedOption);
        const userCheck = await checkUser(username.value);
        if (!userCheck) {
            alert("Intenta con otro Usuario")
            return false;
        }
        if (!username.value || !paterno.value || !password.value || !nombre.value || !materno.value || id == null) {
            alert('Llena todos los campos');

        } else {
            const hash = await bcrypt.hash(password.value, 10)
            
            const userChecked = {
                nombreUsuario: username.value,
                apellidoPaterno: paterno.value,
                apellidoMaterno: materno.value,
                nombre: nombre.value,
                password: hash,
                rol: id,
                status: 'Activo'
            }
            const newUser = await addUserDoc(userChecked);
            if (newUser) {
                alert("Usuario Creado!")
                navigate('/Usuarios')
            } else {
                alert("Hubo un problema al crear el usuario")
            }
        }


    }
    useEffect(() => {

        const obtenerDatos = async () => {
            try {
                const rolOptions = await fetchData(); // Llama a la función fetchData
                setOptions(rolOptions); // Asigna el resultado al estado "data"
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };
        obtenerDatos();
    }, []);
    return (
        <div className='h-screen bg-black space-y-8 px-20'>
            <h1 className='font-bold text-white text-3xl text-center'>Agregar Usuario</h1>
            <form action="click">
                <div className='grid grid-rows-3 grid-cols-2 items-center justify-center  mx-20 gap-y-4 ' >

                    <div className='space-x-4 flex'>
                        <h1 className="text-white text-3xl">Nombre: </h1>

                        <input type="text"
                            id='nombre'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3'
                        />
                    </div>
                    <div className='space-x-5 flex  items-center'>
                        <h1 className="text-white text-3xl">Apellido <br /> Paterno : </h1>

                        <input type="text"
                            id='paterno'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3'
                        />
                    </div>
                    <div className='space-x-5 flex  items-center'>
                        <h1 className="text-white text-3xl">Apellido <br /> Materno : </h1>
                        <input type="text"
                            id='materno'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3'
                        />
                    </div>
                    <div className='space-x-12 flex'>
                        <h1 className="text-white text-3xl">Rol: </h1>

                        <select
                            value={selectedOption}
                            className="bg-slate-300 rounded-lg w-60 h-10 "
                            onChange={(e) => setSelectedOption(e.target.value)}
                        >
                            <option value="">Selecciona una opción</option>
                            {options.map((item, index) => (
                                <option key={index} value={item.cargo}>
                                    {item.cargo}
                                </option>
                            ))}
                        </select>

                    </div>
                    <div className='space-x-10 flex '>
                        <h1 className="text-white text-3xl">Usuario: </h1>
                        <input type="text"
                            id='username'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3'
                            onBlur={blurFunction}
                        />
                    </div>
                    <div className='space-x-4 flex'>
                        <h1 className="text-white text-3xl">Contraseña: </h1>
                        <input type="password"
                            id='password'
                            className='bg-slate-300 w-80 rounded-lg h-10 pl-3'
                        />
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
                        onClick={addUser}
                    >
                        <h1 className="text-3xl" > Guardar </h1>
                    </button>
                </div>

            </form>
        </div>
    )
}
