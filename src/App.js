import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Clients from './pages/Clients';
import Agents from './pages/Agents';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

function App() {
    const [agents, setAgents] = useState([]);  // Centralized agent state
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Guest');

    useEffect(() => {
        // Update userRole if it changes in localStorage
        const handleStorageChange = () => {
            setUserRole(localStorage.getItem('userRole') || 'Guest');
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const addAgent = (newAgent) => {
        setAgents((prevAgents) => [...prevAgents, newAgent]);
    };

    // Update userRole if login/logout happens within the app
    const updateUserRole = (role) => {
        localStorage.setItem('userRole', role);
        setUserRole(role);
    };

    return (
        <Router>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login updateUserRole={updateUserRole} />} />

                {/* Protected Routes */}
                <Route
                    path="/*"
                    element={
                        <PrivateRoute>
                            <div className="flex h-screen">
                                {/* Pass userRole to Sidebar */}
                                <Sidebar userRole={userRole} />
                                <div className="flex-1 p-8 md:p-6 bg-gray-100 overflow-auto">
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/properties" element={<Properties />} />
                                        <Route path="/clients" element={<Clients />} />
                                        <Route
                                            path="/agents"
                                            element={<Agents agents={agents} addAgent={addAgent} />}
                                        />
                                        {/* Pass userRole to Settings */}
                                        <Route path="/settings" element={<Settings userRole={userRole} />} />
                                    </Routes>
                                </div>
                            </div>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;