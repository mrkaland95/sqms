import './css/basic-button.css'
import React, {FormEvent} from "react";


export default function BasicButtonBlue(props: {children?: React.ReactNode, type: 'button' | 'submit', onClick?: () => {}}) {
    const buttonType = props.type

    if (buttonType === 'submit') {
        if (props.onClick) {
            throw new Error(`onClick must not be defined with button type "submit"`)
        }
    }

    return <>
    <button className={"basic-button-1"} type={buttonType}>
        <span className={"basic-button-1-text"}>
            {props.children}
        </span>
    </button>
    </>
}