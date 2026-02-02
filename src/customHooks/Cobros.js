import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
export async function cobroCode() {
    try {
        const db = getFirestore();

        const pzRef = collection(db, "Cobro"); // Reemplaza "opciones" con el nombre de tu colección
        const querySnapshot = await getDocs(pzRef);

        let maxId = 0;

        querySnapshot.forEach((doc) => {
            const datos = doc.data();
            const id = parseInt(datos.nuCobro, 10);
            if (id > maxId) {
                maxId = id;
            }
        });


        // Establecer el próximo ID disponible
        return maxId + 1;
    } catch (error) {
        console.error('Error al obtener el máximo ID:', error);
    }
};

export async function addCobro(data) {

    const db = getFirestore();

    const optionsRef = collection(db, "Cobro"); // Reemplaza "opciones" con el nombre de tu colección
    const collectionRef = collection(db, 'Ventas');
    const q = query(collectionRef, where("nuVenta", "==", parseInt(data.nuVenta)));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size === 0) {
            console.log('No se encontraron documentos con el ID proporcionado.');
            return false;
        } else {
            querySnapshot.forEach(async (queryDocumentSnapshot) => {
                const docRef = doc(collectionRef, queryDocumentSnapshot.id);

                // Realiza la actualización del atributo del documento
                const updateData = {
                    saldo: data.saldo
                };
                await updateDoc(docRef, updateData);
            })
        }
        await addDoc(optionsRef, data);
        return true;
    } catch (error) {
        alert('Error en la base de datos: al crear usuario ' + error)
        return false;

    }
}

export const fetchCobros = async () => {
    try {
        const db = getFirestore();
        const optionsRef = collection(db, "Cobro"); // Reemplaza "opciones" con el nombre de tu colección
        const querySnapshot = await getDocs(optionsRef);

        const optionsData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            optionsData.push(data); // Ajusta según la estructura de tus documentos
        });

        return optionsData;
    } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
    }
}
export const fetchCobro = async (cobro) => {
    try {
        const db = getFirestore();
        const optionsRef = collection(db, "Cobro"); // Reemplaza "opciones" con el nombre de tu colección
        const q = query(optionsRef, where("nuCobro", "==", cobro));
        const querySnapshot = await getDocs(q);

        let optionsData;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            optionsData = data; // Ajusta según la estructura de tus documentos
        });

        return optionsData;
    } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
        
        return false;
    }
}

export const editarCobros = async (data) => {
    const db = getFirestore();
    const collectionRef = collection(db, 'Cobro');
    // Realiza una consulta para buscar el documento con el atributo "nombre" igual a "Ejemplo"
    const q = query(collectionRef, where("nuCobro", "==", data.nuCobro));
    const collectionRefV = collection(db, 'Ventas');
    const o = query(collectionRefV, where("nuVenta", "==", parseInt(data.nuVenta)));
    console.log(data.nuVenta)
    try {
        const querySnapshot = await getDocs(q);
        const querySnapshotV = await getDocs(o);
        if(querySnapshotV.size == 0){
            console.log("sin docs");
            return;
        }
        console.log(data.saldo)
        querySnapshotV.forEach(async (queryDocumentSnapshot) => {
            const docRef = doc(collectionRefV, queryDocumentSnapshot.id);

            // Realiza la actualización del atributo del documento
            const updateData = {
                saldo: parseInt(data.saldo)
            };
            await updateDoc(docRef, updateData);
        })
        if (querySnapshot.size === 0) {
            return false;
        } else {
            querySnapshot.forEach(async (queryDocumentSnapshot) => {
                const docRef = doc(collectionRef, queryDocumentSnapshot.id);
                // Realiza la actualización del atributo del documento
                const updateData = {
                    rastreo : data.rastreo,
                    monto : data.monto,
                    fecha: data.fecha,
                    saldo : data.saldo
                };
                await updateDoc(docRef, updateData);
                
            })

        }
        return true;

    } catch (error) {
        return false;
    }
}