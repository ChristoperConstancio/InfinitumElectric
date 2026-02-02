import { getFirestore, collection, query, where, updateDoc, getDocs, doc, addDoc } from "firebase/firestore";


export async function editingUser(id, data) {
  // Obtén la referencia a la colección
  const db = getFirestore();

  const collectionRef = collection(db, 'Usuarios');
  // Realiza una consulta para buscar el documento con el atributo "nombre" igual a "Ejemplo"
  const q = query(collectionRef, where("nombreUsuario", "==", id));

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size === 0) {
      return "Hubo un problema, Intenta de nuevo";
    } else {
      querySnapshot.forEach(async (queryDocumentSnapshot) => {
        const docRef = doc(collectionRef, queryDocumentSnapshot.id);

        // Realiza la actualización del atributo del documento
        const updateData = {
          nombre: data.nombre,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          status: data.status,
          nombreUsuario: data.nombreUsuario,
          rol: data.rol
        };

        await updateDoc(docRef, updateData);

      })
    }
    return "Modificacion Exitosa";
  } catch (error) {
    return 'Error al buscar o actualizar documentos:';
  }
}

export const addUserDoc = async (id) => {
  const db = getFirestore();
  const usersRef = collection(db, "Usuarios");
  try {

    await addDoc(usersRef, id);
    return true;
  } catch (error) {
    alert('Error en la base de datos: al crear usuario ' + error)
  }
}
