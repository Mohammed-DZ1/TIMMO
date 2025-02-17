import { useEffect, useState } from 'react';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser.email);
            setRole(parsedUser.role);
        }
    }, []);

    const login = (email, role) => {
        setUser(email);
        setRole(role);
        localStorage.setItem('user', JSON.stringify({ email, role }));
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem('user');
    };

    return { user, role, login, logout };
};

export default useAuth;
