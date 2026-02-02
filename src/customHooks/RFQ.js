import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc, runTransaction, setDoc, getDoc, increment } from "firebase/firestore";

export async function obtenerFolioUnico() {
    const db = getFirestore();
    const ref = doc(db, "Contadores", "EnviosFinal");

    const nuevoFolio = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);

        if (!snap.exists()) {
            throw "El contador no existe";
        }

        const ultimo = snap.data().ultimoFolio || 0;
        const siguiente = ultimo + 1;

        transaction.update(ref, {
            ultimoFolio: siguiente,
        });

        return siguiente;
    });

    return String(nuevoFolio).padStart(6, "0");
}

export async function fetchRechazos() {
    try {
        const db = getFirestore();

        const optionsRef = collection(db, "Rechazos"); // Reemplaza "opciones" con el nombre de tu colección
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
};
export async function fetchRechId(id) {
    try {
        const db = getFirestore();
        const optionsRef = collection(db, "Rechazos"); // Reemplaza "opciones" con el nombre de tu colección
        const q = query(optionsRef, where("SN_Motor", "==", id));
        const querySnapshot = await getDocs(q);

        const optionsData = [];
        if (querySnapshot.size <= 0) {

            return false;
        }
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            optionsData.push(data); // Ajusta según la estructura de tus documentos
        });

        return optionsData[0];
    } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
    }
};
export async function buscarVFD(id) {
    try {
        const db = getFirestore();
        const optionsRef = collection(db, "Analizados"); // Reemplaza "opciones" con el nombre de tu colección
        const q = query(optionsRef, where("SN_VFD", "==", id));
        const querySnapshot = await getDocs(q);

        const optionsData = [];
        if (querySnapshot.size <= 0) {

            return false;
        }
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            optionsData.push(data); // Ajusta según la estructura de tus documentos
        });

        return optionsData[0];
    } catch (error) {
        console.error("Error al obtener datos de Firebase:", error);
    }
};

export async function addRechazos(data) {

    const db = getFirestore();

    const optionsRef = collection(db, "Rechazos"); // Reemplaza "opciones" con el nombre de tu colección
    try {
        await addDoc(optionsRef, data);
        return true;
    } catch (error) {
        alert('Error en la base de datos: al crear usuario ' + error)
        return false;

    }
}
export async function addAnalizados(data) {

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

export async function addLiberados(data) {

    const db = getFirestore();

    const optionsRef = collection(db, "Liberados"); // Reemplaza "opciones" con el nombre de tu colección
    try {
        await addDoc(optionsRef, data);
        return true;
    } catch (error) {
        alert('Error en la base de datos: al crear usuario ' + error)
        return false;

    }
}
export async function inactivateRFQ(id) {

    // Obtén la referencia a la colección
    const db = getFirestore();

    const collectionRef = collection(db, 'Rfq');

    // Realiza una consulta para buscar el documento con el atributo "nombre" igual a "Ejemplo"
    const q = query(collectionRef, where("Id_rfq", "==", id));

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
export async function fetchRFQPiezasEditar(id) {
    try {
        const db = getFirestore();

        const pzRef = collection(db, "Rfq_pz"); // Reemplaza "opciones" con el nombre de tu colección
        const q = query(pzRef, where("name", "==", id));
        const querySnapshot = await getDocs(q);
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
};
export async function updateRechazo(data) {
    try {
        const db = getFirestore();
        const collectionRef = collection(db, "Rechazos"); // usa tu nombre correcto
        const q = query(collectionRef, where("SN_Motor", "==", data.SN_Motor));

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("⚠️ No se encontró ningún documento con ese SN_Motor.");
            return false;
        }

        // Actualiza todos los documentos encontrados
        for (const document of querySnapshot.docs) {
            const docRef = doc(db, "Rechazos", document.id);
            await updateDoc(docRef, data);
            console.log(`✅ Documento ${document.id} actualizado correctamente.`);
        }

        return true;

    } catch (error) {
        console.error("❌ Error al actualizar el documento:", error);
        return false;
    }
}


export const existeEnAnalizados = async (snMotor) => {
    const db = getFirestore();

    const q = query(
        collection(db, "Analizados"),
        where("SN_Motor", "==", snMotor)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty; // true si existe
};



export async function inactivarRechazos(id) {

    // Obtén la referencia a la colección
    const db = getFirestore();

    const collectionRef = collection(db, 'Rfq');
    // Realiza una consulta para buscar el documento con el atributo "nombre" igual a "Ejemplo"
    const q = query(collectionRef, where("Id_rfq", "==", id));
    console.log(id)
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
        }
        return true;

    } catch (error) {
        return false;
    }
}

export async function addJob(JOB, data) {


    const db = getFirestore();
    const docRef = doc(db, "JOBS", JOB);

    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return false;
    }

    await setDoc(docRef, data);
    return true;


}

export async function getJobsActivas() {
    const db = getFirestore();

  try {
    const q = query(
      collection(db, "JOBS"),
      where("Status", "==", "Abierta")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,      // 👈 la JOB
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error obteniendo JOBs:", error);
    return [];
  }
}

export async function sumarLiberadoAJOB(jobId) {
  try {
    const db = getFirestore();
    const jobRef = doc(db, "jobs", jobId);

    await updateDoc(jobRef, {
      liberados: increment(1),
    });

    return true;
  } catch (error) {
    console.error("Error al sumar liberado:", error);
    return false;
  }
}