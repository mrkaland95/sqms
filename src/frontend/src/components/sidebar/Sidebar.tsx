import './sidebar.css'
import React, {useState} from "react";
import { GoHomeFill } from "react-icons/go";
import { IoChevronDown } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { RiComputerFill } from "react-icons/ri";
import {useAuth} from "../AuthProvider";


function Sidebar({open}: SideBarProps) {
    const dropdownState = true

    const user = useAuth().user
    const isAuthenticated = useAuth().isAuthenticated

    return (
        <div className={`sidebar-container ${open ? 'open' : ''}`}>
            <nav>
                <ul style={{margin: 'none', border: 'none'}}>
                    <SidebarAnchor buttonText={"Home"} href={"/"} icon={<GoHomeFill/>}/>

                    {isAuthenticated && (
                        <SidebarDivider/>
                    )}

                    {isAuthenticated && (
                        <SidebarDropdown buttonText={"Your Profile"} icon={<FaUser/>} openState={dropdownState}>
                            {/*<SidebarAnchor buttonText={"Profile"} href={"/profile"}/>*/}
                            <SidebarAnchor buttonText={"User"} href={"/user"}/>
                            <SidebarAnchor buttonText={"Whitelist"} href={"/whitelist"}/>
                        </SidebarDropdown>
                    )}

                    <SidebarDivider/>

                    {user?.isAdmin && (
                        <SidebarDropdown buttonText={"Game Server Permissions"} icon={<RiComputerFill/>} openState={dropdownState}>
                            <SidebarAnchor buttonText={"Admin Groups"} href={"/admingroups"}/>
                            <SidebarAnchor buttonText={"Discord Role Mapping"} href={"/rolesedit"}/>
                            <SidebarAnchor buttonText={"List Endpoints"} href={"/listsedit"}/>
                        </SidebarDropdown>
                    )}

                    {isAuthenticated && (
                        <SidebarDivider/>
                    )}

                    {user?.isAdmin && (
                        <SidebarDropdown buttonText={"Website Management"}>
                            <SidebarAnchor buttonText={"Roles"} href={"/role-management"}/>
                        </SidebarDropdown>
                    )}
                </ul>
            </nav>
        </div>
    )
}

function SidebarDivider() {
    return (<div className={"sidebar-divider"}></div>)
}


/**
 * Component that represents a dropdown menu embedded within the sidebar.
 * @param buttonText
 * @param children
 * @param icon Icon displayed on the left side of the text.
 * @param openState {boolean}
 */
function SidebarDropdown({buttonText, children, icon, openState}: SideBarDropDownProps) {
    if (!openState) {
        openState = false
    }

    const [menuOpen, setMenuOpen] = useState(openState)

    function toggleMenu() {
        setMenuOpen(!menuOpen);
    }

    return (
        <li style={{border: 'none', margin: 'none', padding: 'none'}}>
            <div className={`sidebar-dropdown-wrapper ${menuOpen ? "open" : ""}`}>
                <button onClick={toggleMenu} className={`sidebar-dropdown-button`} title={buttonText}>
                    <div className={"sidebar-element-wrapper-new"}>
                        <span className={`sidebar-element-wrapper-new icon`}>{icon}</span>
                        <span className={"sidebar-element-wrapper-new text"}>{buttonText}</span>
                        <span className={`sidebar-dropdown-icon ${menuOpen ? "open" : ""}`}>
                            <IoChevronDown/>
                        </span>
                    </div>
                </button>

                <ul className={`sidebar-menu-content ${menuOpen ? "open" : ""}`}>
                    {children}
                </ul>
            </div>
        </li>
    )
}


function SidebarAnchor({buttonText, icon, href}: SideBarAnchorProps) {
    return (
        <li style={{border: 'none', margin: 'none', padding: 'none'}}>
            <div className={"sidebar-element-wrapper-new"} title={buttonText}>
                <a href={href}>
                    <span className={"sidebar-element-wrapper-new icon"}>{icon}</span>
                    <span className={"sidebar-element-wrapper-new text"}>{buttonText}</span>
                </a>
            </div>
        </li>
    )
}

interface SideBarProps {
    open: boolean;
}

interface SideBarAnchorProps {
    buttonText: string;
    icon?: React.ReactNode;
    href: string;
}

interface SideBarDropDownProps {
    children?: React.ReactNode;
    buttonText: string;
    icon?: React.ReactNode;
    openState?: boolean;
}


export default Sidebar