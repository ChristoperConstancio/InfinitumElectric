import { getFirestore, collection, query, where, updateDoc, getDocs, doc } from "firebase/firestore";


export default async function editingClient(id, data) {
    // Obtén la referencia a la colección
    const db = getFirestore();
    const collectionRef = collection(db,'Clientes');
    // Realiza una consulta para buscar el documento con el atributo "nombre" igual a "Ejemplo"
    const q = query(collectionRef, where("RFC", "==", id));
 
    try {
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.size === 0) {

          return false;
        } else {
          querySnapshot.forEach(async (queryDocumentSnapshot) => {
            const docRef = doc(collectionRef, queryDocumentSnapshot.id);
            // Realiza la actualización del atributo del documento
            const updateData = {
              Razonsocial: data.Razonsocial,
              RFC: data.RFC,
              Direccion: data.Direccion,
              Contacto: data.Contacto,
              Correo: data.Correo,
              Telefono : data.Telefono
            };
    
            await updateDoc(docRef, updateData);
            
          })
        }
    
        return true;
      } catch (error) {
        return false;
      }
    }

