// Obtener el documento del rol desde la colección "roles"
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export  async function getRol(selectedOption) {
    const db = getFirestore();


    const rolesRef = collection(db, "Roles");
    const rolQuery = query(rolesRef, where("cargo", "==", selectedOption)); // Asumo que el nombre del rol es la clave para buscar
    const rolSnapshot = await getDocs(rolQuery);
    let rolUrl = [] // Aquí almacenarás la URL del rol

    rolSnapshot.forEach((doc) => {
        // Supongo que el campo que contiene la URL es "url"
        rolUrl = doc.data();
    });

    return rolUrl;

}

export async function getUserRol(id) {
    const db = getFirestore();

    id = Number(id);
    const rolesRef = collection(db, "Roles");
    const rolQuery = query(rolesRef, where("id", "==", id)); // Asumo que el nombre del rol es la clave para buscar
    const rolSnapshot = await getDocs(rolQuery);
    let rolUrl = [] // Aquí almacenarás la URL del rol
    rolSnapshot.forEach((doc) => {
        // Supongo que el campo que contiene la URL es "url"
        rolUrl = doc.data();
    });

    return rolUrl;
}