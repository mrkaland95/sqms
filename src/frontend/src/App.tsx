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
import DiscordRoleEdit from "./pages/DiscordRoleEdit";
import ListEdit from "./pages/ListEdit";
import SidebarNew from "./pages/sidebar/Sidebar";
import {NavBar} from "./pages/navbar/NavBar";
import AuthProvider, {useAuth} from "./components/AuthProvider";
import user from "./pages/User";
import WebsiteRoleManagement from "./pages/WebsiteRoleManagement";


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
                                element={<AdminAuthorizedRoute element={<DiscordRoleEdit />} />}
                            />
                            <Route
                                path="/listsedit"
                                element={<AdminAuthorizedRoute element={<ListEdit />} />}
                            />
                            <Route
                                path={"/website-roles"}
                                element={<AdminAuthorizedRoute element={<WebsiteRoleManagement/>} />}
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
