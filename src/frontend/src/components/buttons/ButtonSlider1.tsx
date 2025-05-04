import {ChangeEvent} from "react";


export default function ButtonSlider1({id, key, title, checked, onToggle, disabled}: toggleSwitchProps) {

    return (
    <>
    <label className={"switch"}
    title={title}
    >
        <input
            id={id}
            title={title}
            key={key}
            type={"checkbox"}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onToggle(e)}
        />
        <span className={"slider"}></span>
    </label>
    </>)
}

interface toggleSwitchProps {
    checked: boolean
    title?: string
    key?: string
    id?: string
    disabled?: boolean
    onToggle: (e: ChangeEvent<HTMLInputElement>) => void
}