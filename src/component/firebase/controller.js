import { addDoc, collection, doc, getDocs } from "firebase/firestore"
import { db } from "./config"

const docName = "wishes";

export const AddWish = async (name, content) => {
    try{
        const docRef = await addDoc(collection(db, docName), {
            name: name,
            content: content,
        });

        console.log("Document written with ID: ", docRef.id);
    }catch(e){
        console.error("Error adding docment: ", e);
    }
}

export const GetWishes = async (content) => {
    try{
        const querySnapshot = await getDocs(collection(db,docName));
        /*
        querySnapshot.forEach((doc)=>{
            console.log(`${doc.id} => ${doc.data}`)
        });
        */
        return querySnapshot;
    }catch(e){
        console.error(e);
    }
    return [];
}
