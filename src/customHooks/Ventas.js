import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";


export async function getVentasAll() {
    try {
        const db = getFirestore();

        const pzRef = collection(db, "Ventas"); // Reemplaza "opciones" con el nombre de tu colección
        const querySnapshot = await getDocs(pzRef);
        if (querySnapshot.size <= 0) return false;
        const data = [];
        querySnapshot.forEach(doc => {
            const datos = doc.data()
            data.push(datos)
        });
        return data;
    } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
    }
}
export async function getVentasNu(id) {
    try {
        const db = getFirestore();
        const pzRef = collection(db, "Ventas"); // Reemplaza "opciones" con el nombre de tu colección
        const q = query(pzRef, where("nuVenta", "==", parseInt(id)));

        const querySnapshot = await getDocs(q);
        if (querySnapshot.size <= 0) return false;
        let data = '';
        querySnapshot.forEach(doc => {
            const datos = doc.data()
            data = datos;
        });
        return data;
    } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
        return false;
    }
}
export async function sellCode() {
    try {
        const db = getFirestore();

        const pzRef = collection(db, "Ventas"); // Reemplaza "opciones" con el nombre de tu colección
        const querySnapshot = await getDocs(pzRef);

        let maxId = 0;

        querySnapshot.forEach((doc) => {
            const datos = doc.data();
            const id = parseInt(datos.nuVenta, 10);
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
export const addAnalizado = async (data) =>{
    const db = getFirestore();

    const optionsRef = collection(db, "Analizados"); // Reemplaza "opciones" con el nombre de tu colección
    try {
        await addDoc(optionsRef, data);
        return true;
    } catch (error) {
        alert('Error en la base de datos: al crear usuario ' + error)
        return false;

    }
}
export async function addVentaRFQ(data, nuVenta) {
    const db = getFirestore();

    const rfqOptions = collection(db, "Rfq");
  
    try {
      // Iterar sobre cada ID_rfq en el array data
      for (const idRFQ of data) {
        const q = query(rfqOptions, where("Id_rfq", "==", idRFQ));
  
        const querySnapshot = await getDocs(q);
  
        // Verificar si se encontraron documentos con el ID proporcionado
        if (querySnapshot.size === 0) {
          console.log(`No se encontraron documentos con el ID ${idRFQ}.`);
          return false;
        } else {
          // Iterar sobre cada documento encontrado
          querySnapshot.forEach(async (queryDocumentSnapshot) => {
            const docRef = doc(rfqOptions, queryDocumentSnapshot.id);
  
            // Realizar la actualización del atributo del documento
            const updateData = {
              nuVenta: nuVenta,
              state: 'vendido' // Asignar el valor de nuVenta
              // Agregar otros campos si es necesario
            };
  
            await updateDoc(docRef, updateData);
  
          });
        }
      }
  
      return true;
    } catch (error) {
      console.error('Error en la base de datos al actualizar nuVenta:', error);
      return false;
    }
}
export async function inactivateVenta(id) {

    // Obtén la referencia a la colección
    const db = getFirestore();

    const collectionRef = collection(db, 'Ventas');
    // Realiza una consulta para buscar el documento con el atributo "nombre" igual a "Ejemplo"
    const q = query(collectionRef, where("nuVenta", "==", id));

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
                    state: "Inactivo"
                };
                await updateDoc(docRef, updateData);
            })
            return true;

        }
    } catch (error) {
        return false;
    }
}

export const editarVentas = async (data, fecha) => {
    const db = getFirestore();
    const collectionRef = collection(db, 'Ventas');
    // Realiza una consulta para buscar el documento con el atributo "nombre" igual a "Ejemplo"
    const q = query(collectionRef, where("nuVenta", "==", parseInt(data)));

    try {
        const querySnapshot = await getDocs(q);
        console.log(data)

        if (querySnapshot.size === 0) {
            return false;
        } else {
            querySnapshot.forEach(async (queryDocumentSnapshot) => {
                const docRef = doc(collectionRef, queryDocumentSnapshot.id);
                // Realiza la actualización del atributo del documento
                const updateData = {
                    fechaEntrega : fecha
                };
                await updateDoc(docRef, updateData);
                
            })

        }
        return true;

    } catch (error) {
        return false;
    }
}