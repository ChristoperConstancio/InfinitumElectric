import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default async function editClient(id) {
    try {
        // Obtiene una referencia a la colección
        const db = getFirestore();
        const usersRef = collection(db, 'Clientes');
        const q = query(usersRef, where("RFC", "==", id));
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


