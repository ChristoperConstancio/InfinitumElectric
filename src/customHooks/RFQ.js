import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc, runTransaction, setDoc, getDoc, increment } from "firebase/firestore";

const lineas = ["L1", "L2", "L3", "LSA"];

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

    try {
        // 1️⃣ Guardar en Rechazos
        await addDoc(collection(db, "Rechazos"), data);

        // 2️⃣ Preparar FPY
        const fechaMX = getFechaMX();       // ej. 03-02-2026          // L1 | L2 | L3 | LSA
        const estacion = data.Estacion;     // MT | ST | FI

        const campoFPY = `Rechazados${estacion}`;
        // Ejemplo: RechazadosL1MT

        const fpyRef = doc(db, "FPY", fechaMX);

        // 3️⃣ Incrementar FPY
        await updateDoc(fpyRef, {
            [campoFPY]: increment(1)
        });

        return true;

    } catch (error) {
        alert("Error en la base de datos: " + error);
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
export async function createFPYDiario() {
    const db = getFirestore();

    // Fecha MX como ID del documento
    const fechaMX = new Date()
        .toLocaleDateString("es-MX", {
            timeZone: "America/Mexico_City"
        })
        .replaceAll("/", "-");
    console.log("creado")
    const ref = doc(db, "FPY", fechaMX);
    const snap = await getDoc(ref);

    // Si ya existe, no hace nada
    if (snap.exists()) {
        return {
            created: false,
            id: fechaMX
        };
    }

    // Crear documento FPY del día
    await setDoc(ref, {
        fecha: fechaMX,

        // ---- LINEA 1 ----
        LiberadosL1: 0,
        RechazadosL1MT: 0,
        RechazadosL1ST: 0,
        RechazadosL1FI: 0,

        // ---- LINEA 2 ----
        LiberadosL2: 0,
        RechazadosL2MT: 0,
        RechazadosL2ST: 0,
        RechazadosL2FI: 0,

        // ---- LINEA 3 ----
        LiberadosL3: 0,
        RechazadosL3MT: 0,
        RechazadosL3ST: 0,
        RechazadosL3FI: 0,

        // ---- LINEA SA ----
        LiberadosLSA: 0,
        RechazadosLSAMT: 0,
        RechazadosLSAST: 0,
        RechazadosLSAFI: 0,

        createdBy: "FRONTEND",
        createdAt: serverTimestamp()
    });

    return {
        created: true,
        id: fechaMX
    };
}
export async function getFallas() {
    const data = await fetchRechazos();
    const hoy = new Date();
    const fechaFormateada = hoy.toLocaleDateString("en-US");
    console.log(fechaFormateada)
    const filterData = data.filter(item =>
        item.Status == "Rechazado" &&
        item.Fecha === "2/4/2026"
    );
    return filterData;

}
async function getLiberadosHoy(startOfDay) {
    const db = getFirestore();

    const q = query(
        collection(db, "Liberados"),
        where("fecha", ">=", startOfDay)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
}
const getFechasMX = (dias) => {
    const fechas = [];
    const hoy = new Date();

    for (let i = 0; i < dias; i++) {
        const d = new Date(hoy);
        d.setDate(hoy.getDate() - i);
        fechas.push(
            d.toLocaleDateString("es-MX", {
                timeZone: "America/Mexico_City"
            }).replaceAll("/", "-")
        );
    }

    return fechas;
};
const calcularFPY = (liberados, rechazados) => {
  const total = liberados + rechazados;
  console.log(liberados)
  if (total === 0) return 100;
  return +(liberados / total * 100).toFixed(1);
};
export const getFPYGlobalPorWeek = async (week) => {
  const db = getFirestore();

  const q = query(
    collection(db, "FPY"),
    where("week", "==", Number(week))
  );

  const snap = await getDocs(q);

  let liberados = 0;
  let recuperadosST = 0;

  let rechazados = { MT: 0, ST: 0, FI: 0 };

  snap.forEach(docSnap => {
    const fpy = docSnap.data();

    // 🔥 Recuperados es por día, NO por línea
    recuperadosST += fpy.Recuperados || 0;

    lineas.forEach(l => {
      liberados += fpy[`Liberados${l}`] || 0;

      rechazados.MT += fpy[`Rechazados${l}MT`] || 0;
      rechazados.ST += fpy[`Rechazados${l}ST`] || 0;
      rechazados.FI += fpy[`Rechazados${l}FI`] || 0;
    });
  });

  const fpyMT = calcularFPY(liberados, rechazados.MT);
  const fpyST = calcularFPY(liberados, rechazados.ST);
  const fpyFI = calcularFPY(liberados, rechazados.FI);

  const rechazosFinalesST = Math.max(
    rechazados.ST - recuperadosST,
    0
  );

  const fstST =
    liberados > 0
      ? Number(
          ((liberados - rechazosFinalesST) / liberados * 100).toFixed(1)
        )
      : 0;

  return {
    MT: { fpy: fpyMT, rechazos: rechazados.MT },
    ST: {
      fpy: fpyST,
      fst: fstST,
      rechazos: rechazados.ST,
      recuperados: recuperadosST
    },
    FI: { fpy: fpyFI, rechazos: rechazados.FI }
  };
};

export const getFPYPorWeek = async (week) => {
  const db = getFirestore();

  const q = query(
    collection(db, "FPY"),
    where("week", "==", Number(week))
  );

  const snap = await getDocs(q);

  const rows = [];

  snap.forEach(docSnap => {
    const fpy = docSnap.data();

    let liberadosDia = 0;
    let rechazadosDia = { MT: 0, ST: 0, FI: 0 };

    lineas.forEach(l => {
      liberadosDia += fpy[`Liberados${l}`] || 0;

      rechazadosDia.MT += fpy[`Rechazados${l}MT`] || 0;
      rechazadosDia.ST += fpy[`Rechazados${l}ST`] || 0;
      rechazadosDia.FI += fpy[`Rechazados${l}FI`] || 0;
    });

    rows.push({
      fecha: docSnap.id,
      week: fpy.week,
      MT: {
        fpy: calcularFPY(liberadosDia, rechazadosDia.MT),
        rechazos: rechazadosDia.MT
      },
      ST: {
        fpy: calcularFPY(liberadosDia, rechazadosDia.ST),
        rechazos: rechazadosDia.ST
      },
      FI: {
        fpy: calcularFPY(liberadosDia, rechazadosDia.FI),
        rechazos: rechazadosDia.FI
      }
    })
})
console.log(rows)
return rows
}
    

function getFechaMX() {
    return new Date()
        .toLocaleDateString("es-MX", {
            timeZone: "America/Mexico_City"
        })
        .replaceAll("/", "-");
}

export async function addLiberados(data) {
    const db = getFirestore();

    try {
        // 1️⃣ Guardar en Liberados
        await addDoc(collection(db, "Liberados"), data);

        // 2️⃣ Preparar FPY
        const fechaMX = getFechaMX();               // ej. 03-02-2026
        const linea = data.linea;                   // L1 | L2 | L3
        const campoFPY = `Liberados${linea}`;       // LiberadosL1, L2, L3
        console.log(campoFPY)
        console.log(linea)

        const fpyRef = doc(db, "FPY", fechaMX);

        // 3️⃣ Incrementar FPY
        await updateDoc(fpyRef, {
            [campoFPY]: increment(1)
        });

        return true;

    } catch (error) {
        alert("Error en la base de datos: " + error);
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
        const jobRef = doc(db, "JOBS", jobId);

        await updateDoc(jobRef, {
            liberados: increment(1),
        });

        return true;
    } catch (error) {
        console.error("Error al sumar liberado:", error);
        return false;
    }
}
