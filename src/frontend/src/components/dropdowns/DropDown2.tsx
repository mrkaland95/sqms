/**
 * Deprecated
 */


import {DiscordRole} from "../../../../shared-types/shared-types";

/**
 * Implemented roughly from
 * https://youtu.be/IF6k0uZuypA?si=QJcQGmgaYTNSTeBv
 */
function DropDownMenu({discordRoles, onSubmit}: DropDownMenuProps) {

    function DropDownItem(props: DropDownItemProps) {
        return (
            <div className={"drop-down-item"} onClick={(e) => props.onClick(props.children)}>
                <span className={"icon-button"}>{props?.leftIcon}</span>
                {props.children}
                <span className={"icon-right"}>{props?.rightIcon}</span>
            </div>
        )
    }

    return (
        <div className={"default-dropdown"}>
            {discordRoles.map((role: DiscordRole) => (
                <DropDownItem id={role.RoleID} children={role.RoleName} onClick={onSubmit} />
            ))}
        </div>)
}


interface DropDownMenuProps {
    discordRoles: DiscordRole[]
    onSubmit: (role: any) => void
}


interface DropDownItemProps {
    id: string
    leftIcon?: string
    rightIcon?: string
    onClick: (item: any) => void
    children: any
}
