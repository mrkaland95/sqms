import './clear-button.css'
import React from "react";
/*
Represents a button used for clearing a row of data.
 */
function ClearButton(props: {text: string, size?: number, onClick: (e: React.MouseEvent) => void}) {
    return (
    <button className={"clear-button"} onClick={props.onClick} title={props.text} type={"button"} style={{height: props.size, width: props.size}}>
        x
    </button>)
}

export default ClearButton