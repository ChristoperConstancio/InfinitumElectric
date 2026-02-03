import React from 'react'
import logo from '../assets/rayo.png'
import shut from '../assets/shutdown.png'
import back from '../assets/left-arrow.png'
import { useNavigate, Link } from 'react-router-dom'
function HeaderB({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-1);
  }
  const logOut = () => {
    localStorage.clear();

    setIsAuthenticated(false); // 🔥 React se entera

    navigate('/login', { replace: true });

  }
  const username = localStorage.getItem('username');
  return (
    <div className="
    h-16 md:h-20
    w-full
    flex items-center justify-between
    px-3 md:px-6
    bg-gradient-to-r from-red-900 via-red-700 to-red-500
    shadow-lg
  ">
      {/* ⬅️ Logo + Back */}
      <div className="flex items-center gap-2 md:gap-3">


        <Link to={"/bienvenido"}>
          <img
            src={logo}
            alt="Logo"
            className="h-10 md:h-14"
          />
        </Link>

        {/* Texto solo en pantallas medianas+ */}
        <h1 className="hidden sm:block text-white font-bold text-lg md:text-3xl">
          Quality Saltillo
        </h1>
      </div>

      {/* 👤 Usuario + Logout */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Oculta texto en móvil */}
        <p className="hidden sm:block text-white text-sm md:text-base">
          <span className="font-bold">Hola,</span> {username}
        </p>

        <button onClick={logOut}>
          <img
            src={shut}
            alt="Logout"
            className="h-6 w-6 md:h-8 md:w-8"
          />
        </button>
      </div>
    </div>
  );

}

export default HeaderB