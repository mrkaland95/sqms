import {useQueries} from "@tanstack/react-query";
import {
    deleteWebsiteRoleByID, getAllDiscordRoles,
    getRoleMapping,
    getWebsiteRoles,
    postRoleMapping,
    postWebsiteRoles
} from "../utils/data-fetch";
import {DiscordRole, PermissionMapping, WebsitePermissions, WebsiteRole} from "../shared/shared-types";
import React, {Dispatch, SetStateAction, useState} from "react";
import '../css/website-management.css'
import '../css/utils.css'
import '../css/styles.css'
import OptionsDropdown, {OptionsItem} from "../components/dropdowns/OptionsDropdown";
import {groupPermissionsByCategory, WebsitePermissionMetadata} from "../shared/utils";
import Swal from "sweetalert2";
import ManagementTable from "../components/management-table/ManagementTable";
import BasicButtonBlue from "../components/buttons/BasicButtonBlue";
import AddRoleDropdown, {AddRoleDropdownItem} from "../components/dropdowns/AddRoleDropdown";

const groupedPermissions = groupPermissionsByCategory(WebsitePermissionMetadata);


/**
 * Top level component for the website role management page.
 * @constructor
 */
function WebsiteRoleManagement() {
    const [websiteRolesQuery, mappedRolesQuery, allDiscordRolesQuery] = useQueries({queries: [
            {
                queryKey: ['websiteRoles'],
                queryFn: getWebsiteRoles
            },
            {
                queryKey: ['mappedRoles'],
                queryFn: getRoleMapping
            },
            {
                queryKey: ['alldiscordroles'],
                queryFn: getAllDiscordRoles
            }
        ]
    })

    if (websiteRolesQuery.isLoading || mappedRolesQuery.isLoading || allDiscordRolesQuery.isLoading) return <p>Loading...</p>;
    if (websiteRolesQuery.error || mappedRolesQuery.error || allDiscordRolesQuery.error) return <p>Error occurred when loading page</p>;
    if (!websiteRolesQuery.data || !mappedRolesQuery.data || !allDiscordRolesQuery.data) return <p>Something went wrong when loading your whitelist data</p>


    return (
        <WebsiteRoleManagementPage websiteRoles={websiteRolesQuery.data} mappedRoles={mappedRolesQuery.data} allDiscordRoles={allDiscordRolesQuery.data}></WebsiteRoleManagementPage>
    )
}

/**
 * Component containing the actual content of the website role management page.
 * @constructor
 */
function WebsiteRoleManagementPage(props: PageProps) {
    const [websiteRoles, setWebsiteRoles] = useState<WebsiteRole[]>(props.websiteRoles)
    const [mappedRoles, setMappedRoles] = useState<PermissionMapping[]>(props.mappedRoles)
    const [allDiscordGuildRoles, setAllDiscordGuildRoles] = useState<DiscordRole[]>(props.allDiscordRoles)

    function onAddRole() {
        const newRole = getEmptyRole()
        setWebsiteRoles([...websiteRoles, newRole])
    }

    function onAddDiscordRoleBinding() {
        const newRole = getEmptyMapping()
        setMappedRoles([...mappedRoles, newRole])
    }

    async function onSubmitWebsiteRoles(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        let response = await Swal.fire({
            title: 'Are you sure you want to save your changes?',
            text: "These changes are permanent!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Save'
        })

        if (!response.isConfirmed) return;
        try {
            const result =  await postWebsiteRoles(websiteRoles)

            if (result.status === 200) {
                response = await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Website roles saved successfully!',
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                    timer: 2500
                })
            }

        } catch (e) {
            console.error(e)
            response = await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while saving the website roles. Please try again later.',
                showConfirmButton: true,
                confirmButtonText: 'Ok',
            })
        }
    }

    async function onSubmitMappedRoles(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        let response = await Swal.fire({
            title: 'Are you sure you want to save your changes?',
            text: "These changes are permanent!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Save'
        })
        if (!response.isConfirmed) return;
        try {
            const result = await postRoleMapping(mappedRoles)

            if (result.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Website roles saved successfully!',
                    showConfirmButton: true,
                    confirmButtonText: 'Ok',
                    timer: 2500
                })
            }
        } catch (e) {
            response = await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while saving the website roles. Please try again later.',
                showConfirmButton: true,
                confirmButtonText: 'Ok',
            })
        }
    }

    function onMappedRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setMappedRoles((prev) => {
            const updated = [...prev]
            const i = updated.findIndex(elem => e.target.name === elem.permissionID)
            if (e.target.value === "None") {
                updated[i].mappedWebsiteRole = null;
            } else {
                updated[i].mappedWebsiteRole = websiteRoles.find(role => role.roleID === e.target.value)
            }

            return updated
        })
    }

    async function onWebsiteRoleDelete(role: WebsiteRole) {
        let userResponse = await Swal.fire({
            title: 'Are you sure you want to delete this role?',
            text: "This action is permanent!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete'
        })

        if (!userResponse.isConfirmed) return;

        const result = await deleteWebsiteRoleByID(role.roleID)

        if (result.status !== 200) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while deleting the website role. Please try again later.',
                showConfirmButton: true,
                confirmButtonText: 'Ok',
            })
        } else {
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Website role deleted successfully!',
                showConfirmButton: true,
                confirmButtonText: 'Ok',
                timer: 2500
            })
        }

        // TODO add confirmation modal and formations.
        setWebsiteRoles(websiteRoles.filter(r => r.roleID !== role.roleID))
    }

    function onMappedRoleDelete(role: PermissionMapping) {
        setMappedRoles(mappedRoles.filter(r => r.permissionID !== role.permissionID))
    }


    function addDiscordRole(discordRole?: DiscordRole) {
        const newRole = getEmptyMapping()

        if (discordRole) {
            newRole.discordRoleID = discordRole.RoleID
            newRole.discordRoleName = discordRole.RoleName
        }

        setMappedRoles([...mappedRoles, newRole])
    }

    // TODO change into a modal for adding a new role?
    
    return (
        <div>

        <div className={"generic-content-wrapper"}>
            <form onSubmit={(e) => onSubmitWebsiteRoles(e)}>
                <ManagementTable
                    onSubmit={() => {}}
                    headerCells={[
                    <th>Role Name</th>,
                    <th>Description</th>,
                    <th>Permissions</th>,
                    <th>Actions</th>,
                ]}>
                    {websiteRoles.map((role: WebsiteRole) =>
                        (<WebsiteRoleItem role={role} setWebsiteRoles={setWebsiteRoles} onRoleDelete={onWebsiteRoleDelete} key={role.roleID} />)
                    )}
                </ManagementTable>
                <div className={"button-container"} style={{marginTop: "10px"}}>
                    <button className={"default-button"} type={"button"} onClick={onAddRole}>Add Role</button>
                    <button className={"default-button"} type={"submit"}>Save Roles</button>
                    <BasicButtonBlue type={"submit"}>
                        Submit Roles
                    </BasicButtonBlue>
                </div>
            </form>
        </div>
            <div className={"generic-content-wrapper"} style={{marginTop: "2rem", width: "100%"}}>
                <form onSubmit={(e) => onSubmitMappedRoles(e)}>
                    <ManagementTable
                        onSubmit={() => {}}
                        headerCells={[
                            <th style={{maxWidth: "2rem"}}>Discord Role ID</th>,
                            <th style={{width: '20px'}}>Website Role</th>,
                            <th>Options</th>,
                        ]}>

                        {mappedRoles.map((role: PermissionMapping) =>
                            (<RoleBindingItem role={role} setMappedRoles={setMappedRoles} onRoleDelete={onMappedRoleDelete} key={role.permissionID} websiteRoles={websiteRoles} />)
                        )}

                    </ManagementTable>
                    <div className={"buttons-container"}>
                        <AddRoleDropdown buttonText={"Add Discord Role Binding"}>
                            {props.allDiscordRoles
                                .filter(role => !mappedRoles.some(mRole => mRole.discordRoleID === role.RoleID))
                                .filter(role => role.RoleName !== "@everyone")
                                .map((role: DiscordRole) => (
                                    <AddRoleDropdownItem onClick={() => addDiscordRole(role)}>{role.RoleName}</AddRoleDropdownItem>
                            ))}
                            <AddRoleDropdownItem onClick={() => addDiscordRole()}>
                                Add Empty Role
                            </AddRoleDropdownItem>
                        </AddRoleDropdown>

                        <button className={"default-button"} type={"submit"}>Save Role Bindings</button>
                        <button className={"default-button"} type={"button"} onClick={onAddDiscordRoleBinding}>Add Discord Role</button>
                    </div>
                </form>
            </div>
        </div>
    )
}



function RoleBindingItem(props: {role: PermissionMapping, setMappedRoles: Dispatch<SetStateAction<PermissionMapping[]>>, onRoleDelete: (onRoleDelete: PermissionMapping) => void, websiteRoles: WebsiteRole[]  }) {
    function onDiscordRoleChange(e: React.ChangeEvent<HTMLInputElement>) {
        props.setMappedRoles((prev) => {
            const updated = [...prev]
            const i = updated.findIndex(elem => props.role === elem)
            updated[i] = {
                ...props.role,
                discordRoleID: e.target.value.trim()
            }

            return updated
        })
    }

    function onWebsiteRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value
        const role = props.websiteRoles.find(role => role.roleID === value)
        props.setMappedRoles((prevState) => {
            const updated = [...prevState]
            const i = updated.findIndex(elem => props.role === elem)
            updated[i].mappedWebsiteRole = role

            return updated
        })
    }


    return (
    <tr className={"website-role-management-list-item"}>
        <td>
            <input
                type={"input"}
                inputMode={"numeric"}
                placeholder={"Discord Role ID"}
                className={"steam-id-input"}
                pattern={"[0-9]+"}
                value={props.role.discordRoleID}
                required={true}
                onChange={(e) => {onDiscordRoleChange(e)}}
            />
        </td>
        <td>
            <select
                required={true}
                value={props.role.mappedWebsiteRole ? props.role.mappedWebsiteRole.roleID : "None"}
                onChange={(e) => {onWebsiteRoleChange(e)}}
            >
                <option defaultChecked={true}>None</option>
                {props.websiteRoles
                    .filter(role => role.roleName)
                    .map((role: WebsiteRole) => (
                        <option key={role.roleID} value={role.roleID}>{role.roleName}</option>
                ))}

            </select>
        </td>
        <td>
            <OptionsDropdown>
                <OptionsItem onClick={() => {props.onRoleDelete(props.role)}} title={`Delete role binding ${props.role.discordRoleID}`.trim()}>Delete</OptionsItem>
            </OptionsDropdown>
        </td>
    </tr>)

}


function WebsiteRoleItem(props: {role: WebsiteRole, setWebsiteRoles: Dispatch<SetStateAction<WebsiteRole[]>>, onRoleDelete: (onWebsiteRoleDelete: WebsiteRole) => void }) {
    function onRoleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        props.setWebsiteRoles((prev) => {
            const updated = [...prev]
            const index = updated.findIndex(elem => props.role === elem)

            updated[index] = {
                ...props.role,
                roleName: e.target.value
            }
            return updated
        })
    }

    function onRoleDescriptionChange(e: React.ChangeEvent<HTMLInputElement>) {
        props.setWebsiteRoles((prev) => {
            const updated = [...prev]
            const index = updated.findIndex(elem => props.role === elem)

            updated[index] = {
                ...props.role,
                description: e.target.value
            }
            return updated
        })
    }

    function onPermissionChange(newPermissions: WebsitePermissions[]) {
        props.setWebsiteRoles((prev) => {
            const updated = [...prev]
            const index = updated.findIndex(elem => props.role === elem)

            updated[index] = {
                ...props.role,
                permissions: newPermissions
            }
            return updated
        })
    }

    return (<tr className={"website-role-management-list-item"}>
        <td>
            <input
                type={"input"}
                placeholder={"Enter Role Name"}
                className={"steam-id-input"}
                value={props.role.roleName}
                required={true}
                onChange={(e) => {onRoleNameChange(e)}}
            />
        </td>
        <td>
            <input
                type={"input"}
                placeholder={"Enter Role Description"}
                className={"steam-id-input"}
                value={props.role.description}
                required={false}
                onChange={(e) => {onRoleDescriptionChange(e)}}
            />
        </td>
        <td>
            <PermissionsSelector selectedPermissions={props.role.permissions} onChange={onPermissionChange}/>
        </td>
        <td>
            <OptionsDropdown>
                <OptionsItem onClick={() => {props.onRoleDelete(props.role)}} title={`Delete role ${props.role.roleName}`.trim()}>Delete</OptionsItem>
            </OptionsDropdown>
        </td>
    </tr>)
}



const PermissionsSelector: React.FC<PermissionsSelectorProps> = ({ selectedPermissions, onChange }) => {
    const [open, setOpen] = useState(false);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    const isAllSelected = selectedPermissions.includes(WebsitePermissions.ADMINISTRATOR);

    const allPermissionKeys = Object.keys(WebsitePermissionMetadata) as WebsitePermissions[];

    const togglePermission = (permission: WebsitePermissions) => {
        if (permission === WebsitePermissions.ADMINISTRATOR) {
            if (selectedPermissions.includes(WebsitePermissions.ADMINISTRATOR)) {
                onChange([]);
            } else {
                onChange([WebsitePermissions.ADMINISTRATOR, ...allPermissionKeys.filter(p => p !== WebsitePermissions.ADMINISTRATOR)]);
            }
        } else {
            if (selectedPermissions.includes(permission)) {
                onChange(selectedPermissions.filter(p => p !== permission));
            } else {
                onChange([...selectedPermissions, permission]);
            }
        }
    };

    const toggleCategory = (category: string) => {
        setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    return (
        <div className="permissions-container">
            <button type={"button"} className="top-toggle" onClick={() => setOpen(!open)}>
                <span className={`arrow ${open ? 'open' : ''}`}>&#9656;</span>
                Permissions
            </button>
            <div className={`permissions-selector ${open ? 'open' : ''}`}>
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div className="permission-category" key={category}>
                        <div className="category-header" onClick={() => toggleCategory(category)}>
                            <span className={`arrow ${openCategories[category] ? 'open' : ''}`}>&#9656;</span>
                            {category}
                        </div>
                        <div className={`category-content ${openCategories[category] ? 'open' : ''}`}>
                            <ul className="permission-list">
                                {permissions.map(({ key, label, description }) => (
                                    <li key={key} className="permission-item">
                                        <div className="tree-line" />
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected || selectedPermissions.includes(key)}
                                                disabled={isAllSelected && key !== WebsitePermissions.ADMINISTRATOR}
                                                onChange={() => togglePermission(key)}
                                            />
                                            <strong>{label}</strong>
                                            <br />
                                            <small>{description}</small>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};



interface PermissionsSelectorProps {
    selectedPermissions: WebsitePermissions[];
    onChange: (permissions: WebsitePermissions[]) => void;
}

function getEmptyRole(): WebsiteRole {
    return {
        roleID: crypto.randomUUID(),
        roleName: "",
        description: "",
        permissions: []
    }
}

function getEmptyMapping(): PermissionMapping {
    return {
        permissionID: crypto.randomUUID(),
        discordRoleID: '',
        mappedWebsiteRole: null
    }
}


interface PageProps {
    websiteRoles: WebsiteRole[]
    mappedRoles: PermissionMapping[]
    allDiscordRoles: DiscordRole[]
}


export default WebsiteRoleManagement