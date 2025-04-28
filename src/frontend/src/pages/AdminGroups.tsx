import {useQuery} from "@tanstack/react-query";
import React, {ChangeEvent, useEffect, useState} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {arrayMove, SortableContext, useSortable} from "@dnd-kit/sortable";
import {getAdminGroups, postAdminGroups} from "../utils/fetch";
import {cancelButtonColor, confirmButtonColor} from "../utils/utils";
import ToggleButton from "../components/Toggle-Button";
import {EditableTable} from "../components/generic-edit-table/GenericEditTable";
import {EditableDataGrid} from "../components/generic-edit-table/GenericEditTable2";
import {AdminGroup} from "../../../shared-types/shared-types";
import ManagementTable from "../components/management-table/ManagementTable";
import OptionsDropdown, {OptionsItem} from "../components/dropdowns/OptionsDropdown";


axios.defaults.withCredentials = true


function AdminGroups() {
    const { data, isLoading, error } = useQuery({
            queryKey: ['admingroups'],
            queryFn: getAdminGroups,
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Unable to retrieve groups from the server</p>;
    if (!data) return <p>Something went wrong when loading your whitelist data</p>

    return (
    <div className={"admin-group-container"}>
        <h1 style={{paddingBottom: '1rem'}}>IN-GAME ADMIN PERMISSION GROUPS</h1>
        <AdminGroupForm adminGroups={data}/>
    </div>
    )
}


function AdminGroupForm({ adminGroups}: AdminGroupFormProps) {
    const [adminGroupRows, setAdminGroupRows] = useState<AdminGroupRow[]>([]);

    // Ensure the "whitelist" row isn't part of the editable data.
    useEffect(() => {
        const filteredGroups = adminGroups.filter(
            (group) => group.GroupName.toLowerCase() !== "whitelist"
        );
        setAdminGroupRows(filteredGroups);
    }, [adminGroups]);

    function onAddGroup() {
        const emptyGroup: AdminGroupRow = {
            GroupID: crypto.randomUUID(),
            GroupName: "",
            Enabled: true,
            IsWhitelistGroup: false,
            Permissions: [],
        };
        setAdminGroupRows((prev) => [...prev, emptyGroup]);
    }

    async function onSubmitGroup() {
        const confirm = await Swal.fire({
            title: "Are you sure you want to submit groups?",
            text: "This action is permanent",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "CANCEL",
            cancelButtonColor: cancelButtonColor,
            confirmButtonColor: confirmButtonColor,
            confirmButtonText: "SUBMIT",
            focusConfirm: true,
            backdrop: true,
        });

        if (!confirm.isConfirmed) return;

        if (adminGroupRows.some((row) => !row.GroupName)) {
            await Swal.fire({
                title: "Empty group name",
                text: "Groups cannot have an empty name.",
                icon: "warning",
            });
            return;
        }

        const seen = new Set<string>();
        const duplicates = adminGroupRows.filter((row) => {
            if (seen.has(row.GroupName)) {
                return true;
            } else {
                seen.add(row.GroupName);
                return false;
            }
        });

        if (duplicates.length > 0) {
            await Swal.fire({
                title: "Duplicate group names",
                text: `Groups cannot have duplicate names:\n${duplicates
                    .map((g) => g.GroupName)
                    .join("\n")}`,
                icon: "warning",
            });
            return;
        }

        const result = await postAdminGroups(adminGroupRows);

        if (result.statusText === "OK") {
            await Swal.fire({
                title: "Success",
                text: "Successfully updated groups!",
                icon: "success",
            });
        } else {
            await Swal.fire({
                title: "Error",
                text: "Error occurred when updating groups",
                icon: "error",
            });
        }
    }

    async function onRowDelete(group: AdminGroupRow) {
        const confirm = await Swal.fire({
            title: "Delete admin group",
            text: "Are you sure you wish to delete this group? This action cannot be undone.",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            icon: "warning",
        });

        if (!confirm.isConfirmed) return;

        setAdminGroupRows((prev) =>
            prev.filter((row) => row.GroupID !== group.GroupID)
        );

        if (!group._id) {
            await Swal.fire({
                title: "Success",
                text: `Successfully deleted group: ${group.GroupName}`,
                icon: "success",
            });
            return;
        }

        const response = await axios.delete(
            "http://localhost:5000/api/v1/admingroups",
            { data: { id: group.GroupID } }
        );

        if (response.statusText !== "OK") {
            await Swal.fire({
                title: "Error",
                text: "Error occurred when attempting to delete the group.",
                icon: "warning",
            });
            return;
        }

        await Swal.fire({
            title: "Success",
            text: `Successfully deleted group: ${group.GroupName}`,
            icon: "success",
        });
    }

    function onInputChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
        const newGroupName = e.target.value;
        setAdminGroupRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, GroupName: newGroupName } : row
            )
        );
    }

    return (
        <div className={"content-wrapper-box"}>
            <form onSubmit={(e) => {
                e.preventDefault()
                onSubmitGroup()
            }}>
                <ManagementTable
                    headerCells={
                    [
                        <th>Group Name</th>,
                        <th>Permissions</th>,
                        <th>Enabled</th>,
                        <th>Options</th>,
                    ]}
                    onSubmit={() => {}}>
                        <WhitelistGroup />
                        <SortableContext items={adminGroupRows.map((g) => g.GroupID)}>
                            {adminGroupRows.map((group, index) => (
                                <AdminGroupRow
                                    key={group.GroupID}
                                    id={group.GroupID}
                                    row={group}
                                    index={index}
                                    onInputChange={onInputChange}
                                    onRowDelete={onRowDelete}
                                    setAdminGroupRows={setAdminGroupRows}
                                />
                            ))}
                        </SortableContext>
                </ManagementTable>
                <div className={"admin-group-container buttons-container"}>
                    <button type={"submit"} className={"default-button"}>Submit</button>
                    <button type={"button"} className={"default-button"} onClick={onAddGroup}>Add Group</button>
                </div>
            </form>
        </div>
    )
}


/**
 * Represents the table rows to edit the admin group data.
 * @param row
 * @param index
 * @param onInputChange
 * @param onRowDelete
 * @param setAdminGroupRows
 * @constructor
 */
function AdminGroupRow({row, index, onInputChange, onRowDelete, setAdminGroupRows}: any) {
    function onGroupToggle(e: ChangeEvent<HTMLInputElement>, permission: string) {
        if (e.target.checked && !row.Permissions.includes(permission)) {
            row.Permissions.push(permission);
        } else {
            row.Permissions = row.Permissions.filter((value: string) => value !== permission);
        }

        setAdminGroupRows((prev: any) => {
            const updated = [...prev];
            updated[index].Permissions = row.Permissions;
            return updated;
        });
    }


    return (
    <tr key={row.GroupID || index.toString()}>
        <td>
            <input
                className="steam-id-input"
                value={row.GroupName}
                placeholder="Enter Group Name"
                onChange={(e) => onInputChange(index, e)}
                required={true}
            />
        </td>
        <td>
            <div className={"admin-group-container permissions-wrapper"}>
                {Array.from(ALL_POSSIBLE_PERMISSIONS_MAP.keys()).map((permission: string) => (
                    <div>
                        <div style={{display: "flex", justifyContent: "left", alignItems: "center"}}>
                        <ToggleButton
                            checked={row.Permissions.includes(permission)}
                            onToggle={(e) => onGroupToggle(e, permission)}
                            id={`${index.toString()}_${permission}`}
                            title={ALL_POSSIBLE_PERMISSIONS_MAP.get(permission)}
                        />

                        <label
                            style={{paddingLeft: '0.35rem'}}
                            htmlFor={`${index.toString()}_${permission}`}
                            title={ALL_POSSIBLE_PERMISSIONS_MAP.get(permission)}>
                            {permission}
                        </label>
                        </div>

                        <p style={{fontSize: '0.7rem'}}>
                            <em>
                                {ALL_POSSIBLE_PERMISSIONS_MAP.get(permission)}
                            </em>
                        </p>
                    </div>
                ))}
            </div>
        </td>
        <td>
        <ToggleButton
            title={"Whether the group is enabled"}
            checked={row.Enabled} onToggle={(e)=> {
            setAdminGroupRows((prev: any) => {
                const updated = [...prev];
                updated[index].Enabled = e.target.checked
                return updated;
            })
        }}/>
        </td>
        <td>
            <OptionsDropdown size={25}>
                <OptionsItem onClick={() => {onRowDelete(row)}}>Delete</OptionsItem>
            </OptionsDropdown>
        </td>
    </tr>)
}

/**
 * Represents the "hardcoded" whitelist group, meant to be unable to be deleted.
 * @constructor
 */
function WhitelistGroup() {
    return (
        <tr title={"The whitelist group cannot be deleted"}>
            <td>
                <input
                    className={"steam-id-input"}
                    value={"Whitelist"}
                    disabled={true}
                />
            </td>
            <td>
                <div className={"admin-group-container permissions-wrapper"}>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <ToggleButton
                            checked={true}
                            onToggle={(e) => e.preventDefault()}
                            id={"whitelist-checkbox"}
                            disabled={true}
                        />

                        <label htmlFor={"whitelist-checkbox"} style={{paddingLeft: '0.25rem'}}>
                            reserve
                        </label>
                    </div>

                </div>
            </td>
            <td><input type={"checkbox"} disabled={true} checked={true}/></td>
            <td></td>
        </tr>)
}


function ButtonRow({onAddGroup}: any) {
    return (
        <div className={"admin-group-container buttons-container"}>
            <button type={"submit"} className={"default-button"}>Submit</button>
            <button type={"button"} className={"default-button"} onClick={onAddGroup}>Add Group</button>
        </div>)
}


/**
 * Maps a permission, stored as a key, to a value representing a description.
 */
const ALL_POSSIBLE_PERMISSIONS_MAP = new Map([
    ["changemap", "Allows a user to use map commands such as adminSetNextLayer or adminChangeMap."],
    ["canseeadminchat", "Allows a user to *see* the in-game admin chat, as well as teamkills on the feed."],
    ["chat", "Allows a user to *write* in the in-game admin chat, and use server broadcasts."],
    ["balance", "Allows a user to switch teams regardless of current balance."],
    ["kick", "Allows a user to use in game kick commands."],
    ["ban", "Allows a user to use in game ban commands."],
    ["immune", "Users with this permission cannot be kicked or banned."],
    ["manageserver", "Allows a user to use various management commands, including to kill the server."],
    ["cameraman", "Allows a user to use the in-game spectator camera."],
    ["forceteamchange", "Allows a user to force team swap other players."],
    ["reserve", "Allows a user to use the priority/whitelist queue."],
    ["teamchange", "Allows a user to change teams without penalty."],
    ["config", "Allows a user to set server configuration. Does not work for licensed servers."],
    ["pause", "Allows a user to pause the game. Does not work on licensed servers."],
    ["private", "Allows a user to set a server to private, does not work for licensed servers?"],
    ["cheat", "Allows a user to gain access to some cheat commands. Does not work on licensed servers."],
    ["featuretest", "Allows a user to use debug commands, such as spawning vehicles. Does not work on licensed servers"],
    ["debug", "Allows a user to use debug commands."],
])


/**
 * Interface that describes a group of in-game permissions.
 */
export interface IAdminGroup {
    _id?: string
    GroupID: string,
    GroupName: string,
    Permissions: string[]
    Enabled: boolean,
    IsWhitelistGroup: boolean
    createdAt?: Date
    updatedAt?: Date
}


type AdminGroupFormProps = {
    adminGroups: AdminGroupRow[]
}


export type AdminGroupRow = {
    _id?: string
    GroupID: string,
    GroupName: string,
    Permissions: string[]
    Enabled: boolean,
    IsWhitelistGroup: boolean
    createdAt?: Date
    updatedAt?: Date
}



export default AdminGroups
