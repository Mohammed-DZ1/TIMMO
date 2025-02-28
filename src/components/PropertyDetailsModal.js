import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Ensure Firebase is properly imported
import { doc, getDoc } from 'firebase/firestore';

const PropertyDetailsModal = ({ property, onClose, onEdit, onDelete, userRole }) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [touchStartX, setTouchStartX] = useState(0);
    const [visibilitySettings, setVisibilitySettings] = useState({});

    useEffect(() => {
        const fetchVisibilitySettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'visibilitySettings'); // Firestore document path
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setVisibilitySettings(docSnap.data());
                }
            } catch (error) {
                console.error('Error fetching visibility settings:', error);
            }
        };
        
        fetchVisibilitySettings();
    }, []);

    const canShowEditButton = visibilitySettings[userRole]?.showEditButton;
    const canShowDeleteButton = visibilitySettings[userRole]?.showDeleteButton;

    if (!property) return null;

    const SWIPE_THRESHOLD = 50;

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;

        if (swipeDistance > SWIPE_THRESHOLD) {
            handleNextMedia(); // Swipe left
        } else if (swipeDistance < -SWIPE_THRESHOLD) {
            handlePreviousMedia(); // Swipe right
        }
    };

    const handlePreviousMedia = () => {
        setCurrentMediaIndex((prev) => (prev === 0 ? property.media.length - 1 : prev - 1));
    };

    const handleNextMedia = () => {
        setCurrentMediaIndex((prev) => (prev === property.media.length - 1 ? 0 : prev + 1));
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleEdit = () => {
        onEdit();
        onClose();  // Automatically close the popup after editing
    };

    const handleDeleteConfirmation = () => {
        const confirmed = window.confirm("Are you sure you want to delete this property?");
        if (confirmed) {
            onDelete();  // Proceed with deletion if confirmed
            onClose();  // Close the popup after deletion
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">X</button>
                <h2 className="text-2xl font-bold mb-4">{property.title}</h2>
                <p><strong>ID:</strong> {property.propertyId}</p>
                <p><strong>Type:</strong> {property.type}</p>
                <p><strong>Category:</strong> {property.category}</p>
                <p><strong>Price:</strong> ${property.price}</p>
                <p><strong>Location:</strong> {property.location}</p>
                <p><strong>Status:</strong> {property.status}</p>

                {property.media && property.media.length > 0 && (
                    <div className="relative w-full h-64 flex justify-center items-center">
                        <div
                            className="relative w-full h-full cursor-pointer"
                            onClick={toggleFullScreen}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <img
                                src={property.media[currentMediaIndex]}
                                alt="Property media"
                                className="w-full h-full object-cover rounded"
                            />
                        </div>
                        <button onClick={handlePreviousMedia} className="absolute left-0 top-1/2 bg-gray-700 text-white p-3 rounded-full">&#10094;</button>
                        <button onClick={handleNextMedia} className="absolute right-0 top-1/2 bg-gray-700 text-white p-3 rounded-full">&#10095;</button>
                    </div>
                )}

                <div className="mt-4 flex justify-between">
                    {canShowEditButton && (
                        <button onClick={handleEdit} className="bg-green-500 text-white px-4 py-2 rounded">Edit</button>
                    )}

                    {canShowDeleteButton && (
                        <button onClick={handleDeleteConfirmation} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsModal;
