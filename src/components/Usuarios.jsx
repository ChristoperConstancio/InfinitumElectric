import React, { useEffect, useState } from 'react'
import back from '../assets/left-arrow.png'
import { Link } from 'react-router-dom';
import getUsers from '../customHooks/getUsers';
import loupe from '../assets/loupe.png'
import { useNavigate } from 'react-router-dom';
import reset from '../assets/undo.png'
import add from '../assets/add.png'
import edit from '../assets/editing.png'
import remove from '../assets/remove.png'
import inactivate from '../customHooks/inactivateUser';
import { getUserRol } from '../customHooks/getRol';
export default function Usuarios() {
    const [selectedRow, setSelectedRow] = useState(null);
    const [data, setData] = useState([]);
    const target = document.getElementById('targetSearch');
    const navigate = useNavigate();
    const modifyUser = () => {
        if (selectedRow == null) {

            alert('Elige un usuario')
        } else {
            localStorage.setItem('id', selectedRow)
            navigate('/EditarUsuario')
        }
    }
    const inactivateUser = async () => {

        if (selectedRow == null) {
            alert('Elige un usuario')
        } else {
            const validar = prompt(`Escribe SI para eliminar a ${selectedRow} y NO para cancelar`);

            if (validar == "NO") return false;
            if (validar == "SI") {
                const isSuccesful = await inactivate(selectedRow)
                setFilteredData((prevData) => prevData.filter(item => item.id !== selectedRow));
                setData((prevData) => prevData.filter(item => item.id !== selectedRow));

                if (isSuccesful) alert("Borrado exitoso");
            }
        }
    }

    const toggleCheckbox = (id) => {
        console.log(id)
        if (selectedRow === id) {
            setSelectedRow(null); // Desmarca la fila si ya está seleccionada
        } else {
            setSelectedRow(id); // Marca la nueva fila
        }
    };

    const [filteredData, setFilteredData] = useState([]); // Mantener una copia de los datos originales

    const filter = () => {
        // Aplicar el filtro a la copia de los datos originales
        const filtered = data.filter((item) => {
            return item.nombre === target.value;
        });

        // Actualizar el estado con los resultados del filtro
        setFilteredData(filtered);
    }
    const resetData = () => {
        setFilteredData();
        setFilteredData(data);
    }

    useEffect(() => {

        const searchT = async () => {
            let usuarios = [];

            const listUsers = await getUsers();

            if (Array.isArray(listUsers)) {
                const rolesPromises = listUsers.map(async item => {
                    const { cargo } = await getUserRol(item.rol);
                    return {
                        nombre: item.nombre,
                        nombreUsuario: item.nombreUsuario,
                        status: item.status,
                        apellidoMaterno: item.apellidoMaterno,
                        apellidoPaterno: item.apellidoPaterno,
                        rol: cargo
                    };
                });
        
                const usuariosConRoles = await Promise.all(rolesPromises);
        
                setData(usuariosConRoles.filter(item => item.status === 'Activo'));
                setFilteredData(usuariosConRoles.filter(item => item.status === 'Activo'));

            } else {
                // Aquí puedes manejar el caso en el que no se encuentra el usuario
                alert('no hay usuarios');
                // Puedes mostrar un mensaje al usuario, por ejemplo.
            }

        }
        searchT();


    }, [])

    return (
        <>
            <div className='space-x-8 px-7  bg-white  flex text-left'>
                <div className=' w-full' >
                    <h1 className='text-black font-bold text-4xl'>Usuarios</h1>
                    <h2 className='text-black font-bold '>Usuarios Registrados</h2>
                </div>
                <div className='w-full text-right space-y-3'>
                    <div className='flex justify-end space-x-3'>
                        <button onClick={resetData}>
                            <img src={reset} alt="" className='h-6 w-6' />
                        </button>
                        <input type="text"
                            placeholder='Buscar por nombre'
                            className='rounded-xl bg-slate-300 text-black placeholder-gray-600 text-left pl-4 h-7'
                            id='targetSearch'
                        />
                        <button onClick={filter} >
                            <img src={loupe} alt="" className=' h-7 w-7 rounded-lg' />
                        </button>
                    </div>

                    <div className='flex h-6 space-x-3 ml-16'>
                        <Link to={'/Roles'}>
                            <div className='bg-cyan-400 rounded-xl w-32 flex justify-center h-full items-center'>
                                <p className='text-black font-bold text-lg'> Gestionar Rol</p>
                            </div>
                        </Link>
                        <Link to={'/AgregarUsuario'}>
                            <div className='bg-green-400 rounded-xl w-10 flex justify-center h-full items-center'>
                                <img src={add} alt="" className='h-4 w-4' />
                            </div>
                        </Link>
                        <button onClick={modifyUser}>
                            <div className='bg-amber-400 rounded-xl w-10 flex justify-center h-full items-center'>
                                <img src={edit} alt="" className='h-4 w-4' />
                            </div>
                        </button>
                        <button onClick={inactivateUser}>
                            <div className='bg-red-400 rounded-xl w-10 flex justify-center h-full items-center'>
                                <img src={remove} alt="" className='w-4 h-4' />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white text-black p-4 h-screen">
                <table className="table-auto w-full">
                    <thead>
                        <tr className="bg-yellow-500 h-10 ">
                            <th></th>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Apellido Paterno</th>
                            <th>Apellido Materno</th>
                            <th>Status</th>
                            <th>Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredData
                                .map((item, index) =>
                                    <tr key={item.nombreUsuario} className='text-center'>
                                        <td className="bg-white text-black">
                                            <input
                                                type="radio"
                                                checked={selectedRow === item.nombreUsuario}
                                                onChange={() => toggleCheckbox(item.nombreUsuario)}
                                            />
                                        </td>

                                        <td className="bg-white text-black">{item.nombreUsuario}</td>
                                        <td className="bg-white text-black">{item.nombre}</td>
                                        <td className="bg-white text-black">{item.apellidoPaterno}</td>
                                        <td className="bg-white text-black">{item.apellidoMaterno}</td>
                                        <td className="bg-white text-black">{item.status}</td>
                                        <td className="bg-white text-black">{item.rol}</td>

                                    </tr>


                                )}
                    </tbody>
                </table>
            </div>
        </>

    )
}
