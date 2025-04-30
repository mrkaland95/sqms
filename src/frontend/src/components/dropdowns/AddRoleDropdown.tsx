import React, {useEffect, useRef, useState} from "react";
import './css/add-role-dropdown.css'

export default function AddRoleDropdown(props: dropDownProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);


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
        <div style={{display: "inline-block"}}>
            <div className={`add-role-dropdown-wrapper ${menuOpen ? 'open': ''}`} ref={dropdownRef}>
                <button
                    className={"default-button"}
                    onClick={toggleMenu}
                    type={"button"}
                >
                    {props.buttonText}
                </button>
                <ul className={`add-role-dropdown-content ${menuOpen ? 'open' : ''}`}>
                    {props.children}
                </ul>
            </div>

        </div>

    )
}

export function AddRoleDropdownItem(props: {title?: string, onClick?: () => void, leftIcon?: any, rightIcon?: any, children?: React.ReactNode}) {
    return (
    <li className={"add-role-dropdown-item"} title={props.title} onClick={() => props.onClick && props.onClick()}>
        {props.children}
    </li>)
}







interface dropDownProps {
    buttonText?: string
    // buttonClass?: string
    children?: React.ReactNode
}

interface dropDownItemProps {
    children?: React.ReactNode
    onItemClicked?: () => void
    title?: string
    // leftIcon?: any,
    // rightIcon?: any
}