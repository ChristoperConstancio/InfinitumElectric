import React, { useEffect, useState } from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { createTw } from "react-pdf-tailwind";
import { getVentasAll } from './Ventas';
import logo from '../assets/SOLMAQ.png'

function Reportes({ informacion, cliente }) {
    // The 'theme' object is your Tailwind theme config
    const tw = createTw({
        theme: {
            fontFamily: {
                sans: ["Comic Sans"],
            },
            extend: {
                colors: {
                    custom: "#bada55",
                },
            },
        },
    });


    return (
        <Document>
            <Page size={'A4'} style={tw("p-12 w-screen")}>
                <View>
                    <View style={(tw("mx-5 justify-between flex"))}>
                        <View style={(tw(" text-right"))}>

                            <Image src={logo} alt="" style={(tw('w-32 h-20'))} />
                            <Text style={(tw('text-sm'))}>SOLMAQ S.A de C.V</Text>
                            <Text style={(tw('text-sm'))}>Libramiento Oscar Flores Tapia #1030</Text>
                        </View>
                        <View style={tw('')}>
                            <Text style={(tw('text-sm'))}>Cliente : {cliente.Razonsocial}</Text>
                            <Text style={(tw('text-sm'))}>Direccion : {cliente.Direccion}</Text>
                            <Text style={(tw('text-sm'))}>Telefono : {cliente.Telefono}</Text>
                            <Text style={(tw('text-sm'))}>Contacto : {cliente.Contacto}</Text>
                            <Text style={(tw('text-sm'))}>RFC : {cliente.RFC}</Text>
                            <Text style={(tw('text-sm'))}>Correo : {cliente.Correo}</Text>
                        </View>

                    </View>
                    <View>
                    </View>
                    <View style={tw("table border border-solid border-t-0 border-l-0 border-r border-b-0")}>
                        <Text style={tw("mx-auto mt-5 text-sm text-bold text-3xl")}>COBROS REALIZADOS</Text>
                        <Text style={tw("mx-auto mt-5 text-sm text-black")}> Total a cobrar: ${informacion[0].total}</Text>

                        <View style={tw("mx-auto flex-row")}>
                            <View style={tw("w-1/5 border border-solid border-t-0 border-l-0 bg-yellow-500")}>
                                <Text style={tw("mx-auto mt-5 text-sm")}>N° Cobro</Text>
                            </View>
                            <View style={tw("w-1/5 border border-solid border-t-0 border-l-0 bg-yellow-500")}>
                                <Text style={tw("mx-auto mt-5 text-sm")}>Fecha</Text>
                            </View>
                            <View style={tw("w-1/5 border border-solid border-t-0 border-l-0 bg-yellow-500")}>
                                <Text style={tw("mx-auto mt-5 text-sm")}>Tipo</Text>
                            </View>
                            <View style={tw("w-1/5 border border-solid border-t-0 border-l-0 bg-yellow-500")}>
                                <Text style={tw("mx-auto mt-5 text-sm")}>Monto</Text>
                            </View>
                            <View style={tw("w-1/5 border border-solid border-t-0 border-l-0 bg-yellow-500")}>
                                <Text style={tw("mx-auto mt-5 text-sm")}>Saldo</Text>
                            </View>
                        </View>
                        <View style={tw("mx-auto")}>
                            {informacion.map((item, index) => (
                                <View key={index} style={tw("flex-row")}>
                                    <View style={tw("w-1/5 border border-solid border-t-0 border-l-0")}>
                                        <Text style={tw("mx-auto mt-5 text-sm")}>{item.nuCobro}</Text>
                                    </View>
                                    <View style={tw("w-1/5 border border-solid border-t-0 border-l-0")}>
                                        <Text style={tw("mx-auto mt-5 text-sm")}>{item.fecha}</Text>
                                    </View>
                                    <View style={tw("w-1/5 border border-solid border-t-0 border-l-0")}>
                                        <Text style={tw("mx-auto mt-5 text-sm")}>{item.tipoPago}</Text>
                                    </View>
                                    <View style={tw("w-1/5 border border-solid border-t-0 border-l-0")}>
                                        <Text style={tw("mx-auto mt-5 text-sm")}>{item.monto}</Text>
                                    </View>
                                    <View style={tw("w-1/5 border border-solid border-t-0 border-l-0")}>
                                        <Text style={tw("mx-auto mt-5 text-sm")}>{item.saldo}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    )
}

export default Reportes