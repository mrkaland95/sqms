import React from "react";
import {SyntheticListenerMap} from "@dnd-kit/core/dist/hooks/utilities";

export default function DragToSort(props: {listeners?: SyntheticListenerMap, size?: number, style?: React.CSSProperties}) {
    return (
    <span {...props.listeners} style={{ cursor: "grab", fontSize: props.size, ...props.style}}>
        ☰
    </span>)
}