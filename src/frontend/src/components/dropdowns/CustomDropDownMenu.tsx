import React, { useEffect, useRef, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import '../../css/dropdown.css'

function CustomDropDownMenu({buttonText, children, buttonClass}: dropDownProps) {
    const[menuOpen, setMenuOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        // return () => {
        //     document.removeEventListener('mousedown', handleClickOutside);
        // };
    }, []);


    function toggleMenu() {
        setMenuOpen(!menuOpen)
    }

    return (
    <div className={`dropdown-menu-wrapper ${menuOpen ? 'open': ''}`} ref={dropdownRef}>
        <button
            type="button"
            onClick={toggleMenu}
            title={buttonText}
            className={buttonClass ? buttonClass : "dropdown-menu-button"}>

            <span>{buttonText}</span>
            <div className={"dropdown-menu-button-icon"}><IoMdArrowDropdown/></div>
        </button>
        <ul className={`dropdown-menu-wrapper content ${menuOpen ? 'open' : ''}`}>
            {children ? children : <li>No Items</li>}
        </ul>
    </div>
    )
}

export function CustomDropDownItem({title, onItemClicked, leftIcon, rightIcon, children}: DropDownItemProps) {
    return (
    <li className={"dropdown-item"} title={title} onClick={() => onItemClicked && onItemClicked()}>
        <span>{leftIcon}</span>
        {children}
        <span>{rightIcon}</span>
    </li>)
}


interface DropDownItemProps {
    children?: React.ReactNode
    onItemClicked?: Function
    title?: string
    leftIcon?: any,
    rightIcon?: any
}

interface dropDownProps {
    buttonText?: string
    buttonClass?: string
    children?: React.ReactNode
}


export default CustomDropDownMenu;