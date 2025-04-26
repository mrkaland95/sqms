import React, {useState} from 'react';
import './css/styles.css';
import './css/table.css'
import './css/globals.css'
import Home from "./pages/Home";
import {Navigate, Route, Routes} from "react-router-dom";
import Profile from "./pages/Profile";
import User from "./pages/User";
import Whitelist from "./pages/Whitelist";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import AdminGroups from "./pages/AdminGroups";
import RoleEdit from "./pages/RoleEdit";
import ListEdit from "./pages/ListEdit";
import SidebarNew from "./components/sidebar/Sidebar";
import {NavBar} from "./components/navbar/NavBar";
import AuthProvider, {useAuth} from "./components/AuthProvider";
import user from "./pages/User";


const queryClient = new QueryClient();

function App() {
    const [sideBarOpen, setSideBarOpen] = useState(true);

    function toggleSideBar() {
        setSideBarOpen(!sideBarOpen);
    }

    return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <div className="app-container">
                <NavBar sidebarOpen={sideBarOpen} sidebarToggleFunction={toggleSideBar}></NavBar>
                <div className="body">
                    <SidebarNew open={sideBarOpen}/>
                    <div className="content-container">
                        <Routes>
                            <Route
                                path="/"
                                element={<Home />}
                            />
                            <Route
                                path="/profile"
                                element={<AuthenticatedRoute element={<Profile/>} />}
                            />
                            <Route
                                path="/user"
                                element={<AuthenticatedRoute element={<User/>} />}
                            />
                            <Route
                                path="/whitelist"
                                element={<AuthenticatedRoute element={<Whitelist/>} />}
                            />
                            <Route
                                path="/admingroups"
                                element={<AdminAuthorizedRoute element={<AdminGroups/>} />}
                            />
                            <Route
                                path="/rolesedit"
                                element={<AdminAuthorizedRoute element={<RoleEdit />} />}
                            />
                            <Route
                                path="/listsedit"
                                element={<AdminAuthorizedRoute element={<ListEdit />} />}
                            />
                        </Routes>
                    </div>
                </div>
            </div>
        </AuthProvider>
    </QueryClientProvider>
    );
}

function AuthenticatedRoute({ element }: ProtectedRouteProps) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <Navigate to="/" />
    }

    return element;
}


function AdminAuthorizedRoute({ element }: ProtectedRouteProps) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user?.isAdmin) {
        return <Navigate to="/" />
    }

    return element;
}

interface ProtectedRouteProps {
    element: JSX.Element;
}


export default App;
