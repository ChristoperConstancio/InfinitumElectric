import React, { useEffect, useState } from 'react'
import { fetchCobros } from '../../customHooks/Cobros';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import ReportesStatus from './ReportesStatus';

function ReportesS() {
    const [lista, setLista] = useState([])
    const [cobros, setCobros] = useState([])
    const [caja, setCaja] = useState([])
    const [verReporte, setVerReporte] = useState(false)
    const generateR = () => {
        // Define las fechas de inicio y fin del rango
        const fechaInicio = new Date(document.getElementById('fechaDe').value);
        const fechaFin = new Date(document.getElementById('fechaA').value);

        // Filtra los documentos que tienen fechas dentro del rango
        let dinero = 0
        let adeudo = 0;
        const documentosFiltrados = cobros.filter(documento => {
            const fechaDocumento = new Date(documento.fecha); 
            dinero += parseInt(documento.monto);
            adeudo += documento.saldo;
            
            return fechaDocumento >= fechaInicio && fechaDocumento <= fechaFin;
        })
        if(documentosFiltrados.length <= 0){
            alert("No hay cobros en este periodo")
            return;
        }
        setCaja({dinero, adeudo})
        setLista(documentosFiltrados);
        setVerReporte(!verReporte)
    }
    useEffect(() => {
            const getCobros = async () => {
                const data = await fetchCobros();
                setCobros(data);
            }
            getCobros();
        }, [])
    
  return (
            <div className='h-screen bg-black'>
                <h1 className='text-white text-3xl items-center text-center font-bold'>Reporte de resultados </h1>
                <div className='flex-row text-center space-y-10 mt-10'>
                    <div>
                        <label htmlFor="" className='text-white text-4xl'> De : </label>
                        <input type="date" id='fechaDe' className='w-52 h-10 rounded-lg pl-2'  />
                    </div>
                    <div>
                        <label htmlFor="" className='text-white text-4xl'> A : </label>
                        <input type="date" id='fechaA' className='w-52 h-10 rounded-lg pl-2'  />
                    </div>
                    <button onClick={generateR} >
                        <div className='bg-purple-400 rounded-xl w-44 flex justify-center h-full items-center'>
                            <h1>Generar Reporte</h1>
                        </div>
                    </button>
                </div>
                <div>
                    PDFvI
                     { verReporte ?
                     
                    <PDFViewer style={{width: "100%", height:"90vh"}}>
                        <ReportesStatus informacion={lista} caja={caja}/>
                    </PDFViewer>
                    :  <h1>Hola</h1>
                }
                </div>
            </div>
        )
    }

    export default ReportesS