import { 
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Client Operations
export const saveClient = async (clientData) => {
    try {
        const clientsRef = collection(db, 'clients');
        const docRef = clientData.clientId ? 
            doc(clientsRef, clientData.clientId) : 
            doc(clientsRef);

        // Add metadata
        const dataToSave = {
            ...clientData,
            updatedAt: serverTimestamp(),
            createdAt: clientData.createdAt || serverTimestamp()
        };

        await setDoc(docRef, dataToSave, { merge: true });
        return { id: docRef.id, ...dataToSave };
    } catch (error) {
        console.error('Error saving client:', error);
        throw error;
    }
};

// Property Operations
export const saveProperty = async (propertyData) => {
    try {
        const propertiesRef = collection(db, 'properties');
        const docRef = propertyData.propertyId ? 
            doc(propertiesRef, propertyData.propertyId) : 
            doc(propertiesRef);

        // Add metadata
        const dataToSave = {
            ...propertyData,
            updatedAt: serverTimestamp(),
            createdAt: propertyData.createdAt || serverTimestamp()
        };

        await setDoc(docRef, dataToSave, { merge: true });
        return { id: docRef.id, ...dataToSave };
    } catch (error) {
        console.error('Error saving property:', error);
        throw error;
    }
};

// Query Operations
export const getClientsByType = async (type) => {
    try {
        const clientsRef = collection(db, 'clients');
        const q = query(
            clientsRef,
            where('type', '==', type),
            orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting clients:', error);
        throw error;
    }
};

export const getPropertiesByStatus = async (status) => {
    try {
        const propertiesRef = collection(db, 'properties');
        const q = query(
            propertiesRef,
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting properties:', error);
        throw error;
    }
};
