import {IAdminGroup} from "./AdminGroups";
import {cancelButtonColor, confirmButtonColor, daysMap, WeekDays} from "../utils/utils";
import React, {useEffect, useState} from "react";
import {useQueries} from "@tanstack/react-query";
import {
    getAdminGroups,
    getAllDiscordRoles,
    getPrivilegedDiscordRoles,
    postPrivilegedDiscordRoles
} from "../utils/data-fetch";
import Swal from "sweetalert2";
import {AdminGroup, DiscordRole, PrivilegedRole} from "../shared/shared-types";
import BaseEditTable, {ButtonWrapper} from "../components/management-table/ManagementTable";
import OptionsDropdown, {OptionsItem} from "../components/dropdowns/OptionsDropdown";
import AddRoleDropdown, {AddRoleDropdownItem} from "../components/dropdowns/AddRoleDropdown";



export default function DiscordRoleEdit() {
    const [rolesQuery, groupsQuery, allRolesQuery] = useQueries({queries: [
            {
                queryKey: ['roles'],
                queryFn: getPrivilegedDiscordRoles
            },
            {
                queryKey: ['admingroups'],
                queryFn: getAdminGroups,

            },
            {
                queryKey: ['alldiscordroles'],
                queryFn: getAllDiscordRoles
            }
        ]
    })


    if (rolesQuery.isLoading || groupsQuery.isLoading || allRolesQuery.isLoading) return <p>Loading...</p>;
    if (rolesQuery.error || groupsQuery.error || allRolesQuery.error) return <p>Error occurred when loading page</p>;
    if (!rolesQuery.data || !groupsQuery.data || !allRolesQuery.data) return <p>Something went wrong when loading your whitelist data</p>


    return (<>
        <div className={"roles-edit-container"}>
            <h1>PRIVILEGED DISCORD ROLES MANAGEMENT</h1>
            <div className={"table-edit-container"}>
                <RoleEditForm adminGroups={groupsQuery.data} privilegedRoles={rolesQuery.data} allDiscordRoles={allRolesQuery.data}></RoleEditForm>
            </div>
        </div>
    </>)
}


function RoleEditForm({privilegedRoles, adminGroups, allDiscordRoles}: RoleEditProps) {
    const [specialRoles, setSpecialRoles] = useState<IPrivilegedRole[]>([...privilegedRoles])
    const [groups, setGroups] = useState<IAdminGroup[]>([...adminGroups]);
    const [discordRoles, setDiscordRoles] = useState<DiscordRole[]>([]);

    useEffect(() => {
        const roles = allDiscordRoles.filter(role => {
            return !privilegedRoles.find(pRole => pRole.RoleID === role.RoleID)
        })

        setDiscordRoles(roles)

    }, [specialRoles, allDiscordRoles])


    function onGroupChange(e: React.ChangeEvent<HTMLSelectElement>, index: number) {
        setSpecialRoles((prevState) => {
            const oldGroups = [...prevState]
            if (e.target.value === "None") {
                oldGroups[index].AdminGroup = undefined
            } else {
                oldGroups[index].AdminGroup = groups.find(group => group.GroupName === e.target.value)
            }

            return oldGroups
        })
    }


    function onAddRoleClick(roleName: string) {
        const clickedRole = allDiscordRoles.find(r => r.RoleName === roleName)
        if (!clickedRole) {
            return
        }

        const newSpecialRoles = [...specialRoles]

        // Defines default values for a role.
        newSpecialRoles.push({
            RoleName: clickedRole.RoleName,
            RoleID: clickedRole.RoleID,
            Enabled: true,
            WhitelistSlots: 0,
            ActiveDays: [],
        })
        setSpecialRoles(newSpecialRoles)
    }

    async function onSubmitRole() {
        const modalResult = await Swal.fire({
            title: "Are you sure you wish to submit roles?",
            text: "This action is permanent",
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: cancelButtonColor,
            confirmButtonColor: confirmButtonColor,
            cancelButtonText: 'CANCEL',
            confirmButtonText: 'SUBMIT',
            focusConfirm: true,
            backdrop: true
        })


        if (!modalResult.isConfirmed) {
            return
        }

        console.log(specialRoles)

        const result = await postPrivilegedDiscordRoles(specialRoles)

        if (!(result.status === 200)) {
            await Swal.fire({
                title: 'Unable to save roles',
                text: 'Something went wrong while saving roles.',
                icon: "error",
            })
        } else {
            await Swal.fire({
                title: 'Successfully saved roles',
                icon: "success"
            })
        }
    }



    return (
        <div className={"content-wrapper-box"}>
            <form onSubmit={onSubmitRole}></form>

            <BaseEditTable headerCells={[
                <th>Discord Role ID</th>,
                <th>Role Name</th>,
                <th>Permission Group</th>,
                <th>Active Days</th>,
                <th>Whitelist Slots</th>,
                <th>Enabled</th>,
                <th>Actions</th>,
            ]} onSubmit={() => {}}>
                {specialRoles.map(((role, index) => (
                    <tr key={index.toString()}>
                        <td title={"The discord role ID, this MUST correspond to a real discord role."}>
                            <input
                                key={`${index.toString()}_id}`}
                                type={"text"}
                                className={`steam-id-input`}
                                value={role.RoleID}
                                placeholder={"Role ID"}
                                onChange={(e) => {
                                    setSpecialRoles((prevState) => {
                                        const updatedRoles = [...prevState]
                                        updatedRoles[index].RoleID = e.target.value
                                        return updatedRoles
                                    })
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type={"text"}
                                className={`steam-id-input`}
                                value={role.RoleName}
                                placeholder={"Name"}
                                required={true}
                                onChange={(e) => {
                                    setSpecialRoles((prevState) => {
                                        const updatedRoles = [...prevState]
                                        updatedRoles[index].RoleName = e.target.value
                                        return updatedRoles
                                    })
                                }}
                            />
                        </td>
                        <td>
                            <select
                                required={true}
                                value={role.AdminGroup?.GroupName || ""}
                                onChange={(e) => onGroupChange(e, index)}>
                                <option defaultChecked={true}>None</option>
                                {groups.map((group) => (
                                    <option key={group.GroupID} value={group.GroupName}>
                                        {group.GroupName}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td>
                            <button
                                type={"button"}
                                title={"Toggle all days"}
                                onClick={() => {
                                    const updated = [...specialRoles]
                                    const allDays = Array.from(daysMap.keys());
                                    const currentDays = [...specialRoles[index].ActiveDays];
                                    const allSelected = allDays.every(day => currentDays.includes(day));
                                    if (allSelected) {
                                        updated[index].ActiveDays = [];
                                    } else {
                                        updated[index].ActiveDays = allDays;
                                    }
                                    setSpecialRoles(updated);
                                }
                                }>

                                Toggle Days
                            </button>
                            {Array.from(daysMap.keys()).map((key: number) => (
                                <div className={"days-wrapper"}>
                                    <input
                                        key={`${index.toString()}_${key}`}
                                        id={`${index.toString()}_${daysMap.get(key)}`}
                                        value={key}
                                        type={"checkbox"}
                                        checked={role.ActiveDays.includes(key)}
                                        title={daysMap.get(key)}
                                        onChange={event => {
                                            const updated = [...specialRoles]
                                            if (event.target.checked && !role.ActiveDays.includes(key)) {
                                                updated[index].ActiveDays.push(key)
                                            } else {
                                                updated[index].ActiveDays = updated[index].ActiveDays.filter(day => day !== key)
                                            }

                                            setSpecialRoles(updated)
                                        }}
                                    />
                                    <label htmlFor={`${index.toString()}_${daysMap.get(key)}`}>
                                        {daysMap.get(key)}
                                    </label>
                                </div>
                            ))
                            }
                        </td>
                        <td>
                            <input
                                type="text"
                                inputMode={"numeric"}
                                pattern={"[0-9]+"}
                                className={`steam-id-input`}
                                value={role.WhitelistSlots}
                                required={true}
                                // maxLength={4}
                                onChange={(event) => {
                                    const updated = [...specialRoles]

                                    let value = parseInt(event.target.value)
                                    if (isNaN(value)) {
                                        value = 0
                                    }
                                    updated[index].WhitelistSlots = value
                                    setSpecialRoles(updated)
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type={"checkbox"}
                                checked={role.Enabled}
                                onChange={(event) => {
                                    const updated = [...specialRoles]
                                    updated[index].Enabled = event.target.checked
                                    setSpecialRoles(updated)
                                }}
                            />
                        </td>
                        <td>
                            <OptionsDropdown>
                                <OptionsItem>Delete</OptionsItem>
                            </OptionsDropdown>
                        </td>
                    </tr>
                )))}

            </BaseEditTable>
            <ButtonWrapper>
                <AddRoleDropdown buttonText={"Add Discord Role"}>
                    {discordRoles
                        .filter(role => role.RoleName !== "@everyone")
                        .map((role) => (
                            <AddRoleDropdownItem onClick={() => onAddRoleClick(role.RoleName)}>{role.RoleName}</AddRoleDropdownItem>
                        ))
                    }

                </AddRoleDropdown>
                    <button
                        type={"button"}
                        className={"default-button"}
                        onClick={onSubmitRole}>
                        Submit
                    </button>
            </ButtonWrapper>
        </div>
    )
}



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




interface RoleEditProps {
    adminGroups: AdminGroup[]
    privilegedRoles: PrivilegedRole[]
    allDiscordRoles: DiscordRole[]
}


export interface IPrivilegedRole {
    _id?: string
    RoleID: string,
    RoleName: string,
    AdminGroup?: IAdminGroup,
    ActiveDays: WeekDays[],
    WhitelistSlots: number
    Enabled: boolean
}



