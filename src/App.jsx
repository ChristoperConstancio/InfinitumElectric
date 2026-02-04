import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";

import Header from "./components/HeaderB";

// Páginas o secciones principales
import Sidebar from "./components/Bienvenido";
import Usuarios from "./components/Usuarios";
import Desensamble from "./components/Desensamble/Desensamble";
import Final from "./components/StFinal/Final";
import ReportesS from "./components/Reportes/ReportesS";
import Fallas from "./components/RFQs/Fallas";
import FormRegistro from "./components/RFQs/RegistroRechazos"; // nuevo formulario
import BuscarRechazo from "./components/Desensamble/DesensambleView";
import FormVFD from "./components/RFQs/RegistroVFDs";
import CrearEnvio from "./components/EnviosSL1/CrearEnvio.jsx";
import JOB from "./components/JOBS/CrearJOB.jsx";
import TablaFPYSencilla from "./components/Reportes/Dashboard.jsx";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('verificado') === "true"
  );

  const tipoUsuario = localStorage.getItem('tipo');
  return (
    <Router>
      <Routes>
        {/* Ruta de login (pública) */}
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />


        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="flex flex-col h-screen bg-gray-100">
                <header className="sticky top-0 z-20 bg-white shadow-md">
                  <Header setIsAuthenticated={setIsAuthenticated} />
                </header>

                <div className="flex flex-1 overflow-hidden">
                  <Sidebar tipoUsuario={tipoUsuario} />
                  <main className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
                    <Routes>
                      <Route path="/" element={<Navigate to="/home" />} />
                      <Route path="/RegistroRechazos" element={<FormRegistro />} />
                      <Route path="/fallas" element={<Fallas />} />
                      <Route
                        path="/usuarios"
                        element={tipoUsuario === "1" ? <Usuarios /> : <Error />}
                      />
                      <Route path="/Envios" element={<CrearEnvio />} />
                      <Route path="/Desensamble" element={<BuscarRechazo />} />
                      <Route path="/Final" element={<Final />} />
                      <Route path="/reportes" element={<ReportesS />} />
                      <Route path="/Analisis" element={<FormVFD />} />
                      <Route path="/JOB" element={<JOB />} />
                      <Route path="/Dashboard" element={<TablaFPYSencilla />} />

                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}