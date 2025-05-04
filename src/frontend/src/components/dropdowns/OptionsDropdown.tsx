import React, {useEffect, useRef, useState} from "react";
import './css/options-dropdown.css'


function OptionsDropdown(props: {buttonText?: string, children?: React.ReactNode, size?: number}) {
    const [menuOpen, setMenuOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    // const optionsIcon = '⋮'
    const optionsIcon = '…'


    // Adds functionality that closes the menu if the user clicks outside it.
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
    }, []);

    function toggleMenu() {
        setMenuOpen(!menuOpen)
    }

    return (
        <div className={`options-menu-wrapper ${menuOpen ? 'open' : ''}`} ref={dropdownRef}>
            <button
                className={`options-menu-button ${menuOpen ? 'open' : ''}`}
                type={"button"}
                onClick={toggleMenu}
                style={{fontSize: props.size}}>

                {optionsIcon}
            </button>
            <ul className={`options-menu-content ${menuOpen ? 'open' : ''}`}>
                {props.children}
            </ul>
        </div>)
}


export function OptionsItem(props: {title?: string, onClick?: () => void, leftIcon?: any, rightIcon?: any, children?: React.ReactNode}) {

    const cursorStyle = props.onClick ? "pointer" : "default"

    return (
    <li style={{cursor: cursorStyle}} className={"options-menu-item"} title={props.title} onClick={() => props.onClick && props.onClick()}>
        <span>{props.leftIcon}</span>
            {props.children}
        <span>{props.rightIcon}</span>
    </li>)
}

export function OptionsDivider(props: {}) {
    return (<div className={"options-menu-divider"}></div>)
}



export default OptionsDropdown;