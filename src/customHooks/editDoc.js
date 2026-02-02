import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default async function editUser(id) {
    try {
        // Obtiene una referencia a la colección
        const db = getFirestore();
        const usersRef = collection(db, 'Usuarios');
        const q = query(usersRef, where("nombreUsuario", "==", id));
        const querySnapshot = await getDocs(q);
        let data;
        if(querySnapshot.size > 0){ 
            querySnapshot.docs.map( (doc) => {
                data = doc.data();
            })

        }
        return data;


    } catch (error) {
    
    }
    
}


