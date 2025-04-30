import './navbar.css'
import squadLogo from '../../public/squad-logo.png'
import defaultDiscordLogo from '../../public/discordblue.png'
import { CiLogout } from "react-icons/ci";
import { performLoginWithAuth} from "../../components/Login";
import {useAuth} from "../../components/AuthProvider";
import React, {useEffect, useRef, useState} from "react";


export function NavBar({sidebarOpen, sidebarToggleFunction}: NavbarProps) {
    const icon = '☰'

    return (
    <nav className={"navbar-new"}>
        <ul className={"navbar-ul"}>
            <li>
                <button className={"nav-sidebar-collapse-button"}
                        onClick={() => sidebarToggleFunction()}
                        type={"button"}
                        title={`${sidebarOpen ? 'Collapse Sidebar' : 'Open Sidebar'}`}
                >
                    {icon}
                </button>
            </li>
            <IconAnchorElement title={"Home"} href={"/"}/>
            <NavbarMiddleFillElement/>
            <LoginElement/>
        </ul>
    </nav>)
}


/**
 * Utility component used to fill the middle, so that the avatar/login buttons gets pushed all the way to the right.
 * @constructor
 */
function NavbarMiddleFillElement() {
    return(<div className={"navbar-fill-element"}></div>)
}

function LoginElement() {
    const isLoggedIn = useAuth().user?.isAuthenticated

    return(
    <li>
        <div className={"login-wrapper"}>{isLoggedIn ? <LoggedInDropdownMenu/> : <UserNotLoggedInElement/>}</div>
    </li>
    )
}

function UserNotLoggedInElement() {
    return(<button className={"nav-login-button"} type={"button"} onClick={performLoginWithAuth}>Login With Discord</button>)
}



function LoggedInDropdownMenu() {
    const [menuOpen, setMenuOpen] = useState(false);
    const user = useAuth().user
    const logout = useAuth().logout
    const dropdownRef = useRef<HTMLDivElement | null>(null);


    const imageSize = 50;

    function toggleMenu() {
        setMenuOpen(!menuOpen);
    }
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
    }, [])

    return (
    <div className={`logged-in-dropdown-menu ${menuOpen ? 'open' : ''}`} ref={dropdownRef}>
        <button style={{width: imageSize, height: imageSize}} className={`nav-bar-user-button ${menuOpen ? 'open' : ''}`} onClick={() => toggleMenu()}>
            <img src={defaultDiscordLogo} alt={"Default discord logo"} className={"nav-bar-user-image"}></img>
        </button>
        <ul className={`logged-in-dropdown-content ${menuOpen ? 'open' : ''}`}>
            <LoggedInMenuText>
                {`Signed in as ${user?.discordGlobalName}`}<br/>
            </LoggedInMenuText>
            <LoggedInMenuText onClick={logout} leftIcon={<CiLogout size={20}/>}>
                Sign Out
            </LoggedInMenuText>
        </ul>
    </div>
    )
}


function LoggedInMenuText(props: {children?: React.ReactNode, onClick?: () => void, leftIcon?: React.ReactNode}) {
    if (props.onClick) {
        return (
            <li style={{cursor: "pointer"}} className={"logged-in-menu-item"} onClick={() => {props.onClick && props.onClick()}}>
                <span className={"logged-in-menu-item icon"}>{props.leftIcon}</span>
                <span className={"logged-in-menu-item text"}>{props.children}</span>
            </li>)
    } else {
        return (
            <li className={"logged-in-menu-item"}>
                <span className={"logged-in-menu-item icon"}>{props.leftIcon}</span>
                <span className={"logged-in-menu-item text"}>{props.children}</span>
            </li>)
    }
}


function LoggedInMenuLink(props: {leftIcon: React.ReactNode, children?: React.ReactNode, text?: string, href: string}) {
    return (
    <li className={"logged-in-menu-item"}>
        <a className={"logged-in-menu-anchor"} href={props.href}>
            <span className={"logged-in-menu-item icon"}>{props.leftIcon}</span>
            <span className={"logged-in-menu-item text"}>{props.text}</span>
        </a>
    </li>)
}


function UserButton({}: {imageSrc: string}) {

}


function NavbarAnchorElement({title, href, text}: NavbarAnchorProps) {
    return (
    <li style={{border: "none", margin: 'none', padding: 'none'}}>
        <a className={"navbar-anchor-element-main"}
           href={href}>
            {text}
        </a>
    </li>)
}

function IconAnchorElement({title, href}: NavbarIconAnchorProps) {
    return (
    <li>
        <a className={"navbar-anchor-logo-element"} href={href}>
            <img src={squadLogo} alt={"Organization Logo"} width={80}/>
        </a>
    </li>)

}


interface NavbarAnchorProps {
    href: string;
    title?: string;
    text: string;
}

interface NavbarProps {
    sidebarOpen: boolean;
    sidebarToggleFunction: Function;
}

interface NavbarIconAnchorProps {
    title: string;
    href: string;
    // logo: string;
}

// export default NavbarNew