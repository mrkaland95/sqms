import React, {useState} from "react";
import { IoChevronDown } from "react-icons/io5";
import './css/expandabledropdown.css'


function ExpandableDropdown({ buttonTitle, buttonText, children }: DropDownProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const chevronSize = 20;

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className={`custom-dropdown-wrapper ${menuOpen ? 'open' : ''}`}>
            <button
                className={`custom-dropdown-button ${menuOpen ? 'open' : ''}`}
                title={buttonTitle}
                type="button"
                onClick={toggleMenu}
            >
                <span>{buttonText}</span>
                <div className={`custom-dropdown-icon ${menuOpen ? 'open' : ''}`}>
                    <IoChevronDown size={chevronSize} />
                </div>
            </button>
            <div className={`custom-dropdown-content ${menuOpen ? 'open' : ''}`}>
                <hr style={{marginBottom: '10px'}}/>
                {children}
            </div>
        </div>
    );
}

interface DropDownProps {
    buttonTitle?: string
    buttonText?: string
    children?: React.ReactNode
}



export default ExpandableDropdown