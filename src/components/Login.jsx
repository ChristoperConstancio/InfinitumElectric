import React, { useEffect } from 'react'
import userImg from '../assets/user.png'
import padLock from '../assets/padlock.png'
import showOff from '../assets/show.png'
import hide from '../assets/hide.png'
import logo from '../assets/INFINITUM.jpg'
import { useState } from 'react';
import { loginUser } from '../customHooks/getDocs'
import { useNavigate } from 'react-router-dom'

function Login({ setIsAuthenticated }) {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const verify = localStorage.getItem('verificado');


  const logear = async (e) => {
    e.preventDefault();
    const { success, nombre, rol } = await loginUser(username, password);
    if (success) {
      console.log(success)

      try {
        localStorage.setItem('username', nombre);
        localStorage.setItem('verificado', "true");
        localStorage.setItem('tipo', rol);
        setIsAuthenticated(true); 

        navigate('/home');
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      alert(nombre)
      console.log(nombre)
    }
  }
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };




  return (

    <div className='flex justify-center items-center bg-red-500 min-h-screen'>
      <div className='bg-white rounded-xl h-96 w-96 '>
        <div className='items-center justify-center flex'>
          <img src={logo} alt="INFINITUM" className='h-30 w-20 pt-6' />
        </div>
        <div className='flex justify-center'>
          <p className='text-2xl font-Poppins'>Inicio de sesion</p>
        </div>
        <div className='pt-16 flex justify-center items-center  '>

          <form onSubmit={logear} >

            <div className='flex gap-x-2 items-center'>
              <img src={userImg} alt="" className='h-6 w-6' />
              <input type="text"
                className="bg-white text-black placeholder-gray-500 pl-2"
                placeholder="Usuario"
                required
                name='user'
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className='flex gap-x-2 items-center pt-3'>
              <img src={padLock} alt="" className='h-6 w-6' />
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                name='password'
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-black placeholder-gray-500 pl-2"
                placeholder="Contraseña"
                required
                autoComplete="current-password"

              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-500 hover:text-black"
              >
                {passwordVisible ? <img src={hide} className='h-5 w-5' /> : <img src={showOff} className='h-5 w-5' />}
              </button>
              <hr />
            </div>
            <div className='flex items-center justify-center'>
              <button
                type='submit'
                className='mt-10 bg-green-400 rounded-xl text-white h-10 w-40 text-lg'

              >
                Iniciar Sesion
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>


  )
}

export default Login