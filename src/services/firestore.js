import { 
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

// Function to check authentication before Firestore operations
const getCurrentUser = () => {
    const auth = getAuth();
    return auth.currentUser;
};

// Client Operations
export const saveClient = async (clientData) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User is not authenticated' };
    }
    
    try {
        const clientsRef = collection(db, 'clients');
        const docRef = clientData.clientId ? 
            doc(clientsRef, clientData.clientId) : 
            doc(clientsRef);

        // Add metadata
        const dataToSave = {
            ...clientData,
            updatedAt: serverTimestamp(),
            createdAt: clientData.createdAt || serverTimestamp(),
            createdBy: user.uid // Track who created the entry
        };

        await setDoc(docRef, dataToSave, { merge: true });
        return { success: true, id: docRef.id, ...dataToSave };
    } catch (error) {
        console.error('Error saving client:', error);
        return { success: false, error: error.message || 'Failed to save client' };
    }
};

// Property Operations
export const saveProperty = async (propertyData) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User is not authenticated' };
    }
    
    try {
        const propertiesRef = collection(db, 'properties');
        const docRef = propertyData.propertyId ? 
            doc(propertiesRef, propertyData.propertyId) : 
            doc(propertiesRef);

        // Add metadata
        const dataToSave = {
            ...propertyData,
            updatedAt: serverTimestamp(),
            createdAt: propertyData.createdAt || serverTimestamp(),
            createdBy: user.uid // Track creator
        };

        await setDoc(docRef, dataToSave, { merge: true });
        return { success: true, id: docRef.id, ...dataToSave };
    } catch (error) {
        console.error('Error saving property:', error);
        return { success: false, error: error.message || 'Failed to save property' };
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
        return { success: false, error: error.message || 'Failed to fetch clients' };
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
        return { success: false, error: error.message || 'Failed to fetch properties' };
    }
};
