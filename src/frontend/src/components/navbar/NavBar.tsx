import './navbar.css'
import squadLogo from  '../../public/squad-logo.png'
import defaultDiscordLogo from '../../public/discordblue.png'
import {handleLogout, redirectToDiscordAuth} from "../Login";
import {useAuth} from "../AuthProvider";
import {useState} from "react";


export function NavBar({sidebarOpen, sidebarToggleCb}: NavbarProps) {
    return (
    <nav className={"navbar-new"}>
        <ul className={"navbar-ul"}>
            <li>
                <button className={"nav-sidebar-collapse-button"}
                        onClick={() => sidebarToggleCb()}
                        type={"button"}
                        title={`${sidebarOpen ? 'Collapse Sidebar' : 'Open Sidebar'}`}>
                    ☰
                </button>
            </li>
            <IconAnchorElement title={"Home"} href={"/"}/>
            <NavbarMiddleFillElement/>
            <LoginElement/>
        </ul>
    </nav>)
}

/*
Utility component used to fill the gap between the left side of the navbar, and shifting content after it to the right side.
 */
function NavbarMiddleFillElement() {
    return(
    <div className={"navbar-fill-element"}></div>)
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
    return(<button className={"nav-login-button"} type={"button"} onClick={redirectToDiscordAuth}>Login With Discord</button>)
}



function UserLoggedInElement() {
    function logoutFunction() {

    }

    return(
        <button className={"nav-user-logged-in-button"} type={"button"} onClick={() => handleLogout()}>Log Out</button>
    )
}

function LoggedInDropdownMenu() {
    const [menuOpen, setMenuOpen] = useState(false);
    const user = useAuth().user

    const imageSize = 50;

    function toggleMenu() {
        setMenuOpen(!menuOpen);
    }

    return (
    <ul>
        <div className={`logged-in-dropdown-menu ${menuOpen ? 'open' : ''}`}>
            <div style={{paddingRight: '1rem', color: "white"}}>{user?.discordGlobalName}</div>
            <button style={{width: imageSize, height: imageSize}} className={`nav-bar-user-button ${menuOpen ? 'open' : ''}`} onClick={() => toggleMenu()}>
                <img src={defaultDiscordLogo} alt={"Default discord logo"} className={"nav-bar-user-image"}></img>
            </button>
        </div>
    </ul>
    )
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
    sidebarToggleCb: Function;
}

interface NavbarIconAnchorProps {
    title: string;
    href: string;
    // logo: string;
}

// export default NavbarNew