import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    // Si no hay usuario, lo mandamos al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si hay usuario, le mostramos el componente que pidió
    return children;
}