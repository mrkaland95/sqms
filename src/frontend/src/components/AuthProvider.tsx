import React, { createContext, useContext, useState, useEffect } from 'react'
import {fetchUserData} from "../utils/fetch";
import {UserResponseData} from "../../../shared-types/shared-types";


const AuthContext = createContext<AuthContextProps | undefined>(undefined);


function AuthProvider({ children } : AuthProviderProps) {
    const [user, setUser] = useState<UserResponseData | null>(null);
    const isAuthenticated = !!user?.isAuthenticated
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData().then((res) => {
            if (res.isAuthenticated) {
                setUser(res);
            } else {
                setUser(null);
            }
        }).catch((err) => {
            console.error("Error occurring when retrieving authentication data.")
            setUser(null)
        }).finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{isAuthenticated, user, setUser, loading}}>
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth(): AuthContextProps {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within the AuthProvider');
    }
    return context;
}


interface AuthProviderProps {
    children?: React.ReactNode;
}

interface AuthContextProps {
    isAuthenticated: boolean;
    user: UserResponseData | null | undefined;
    setUser: React.Dispatch<React.SetStateAction<UserResponseData | null>>
    loading: boolean;
}


export default AuthProvider;