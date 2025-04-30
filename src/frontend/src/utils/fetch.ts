import axios from "axios";
import {AdminGroupRow} from "../pages/AdminGroups";
import {WhitelistResponseData, WhitelistRow} from "../pages/Whitelist";
import {IPrivilegedRole} from "../pages/DiscordRoleEdit";
import {ListEndpoint, UserResponseData} from "../../../shared/shared-types";


const baseURL = "http://localhost:5000";
const baseURL2 = "http://localhost:5000/api/v1";

axios.defaults.withCredentials = true;

export async function getAdminGroups() {
    // const url = `${baseURL}/api/v1/admingroups`
    const url = `/api/v1/admingroups`
    const res = await axios.get(url)

    if (res.status != 200) {
        throw new Error(`Unable to fetch admin group data`)
    }

    return res.data
}

export async function deleteAdminGroup(id: string) {
    const url = `/api/v1/admingroups/${id}`
    const res =  await axios.delete(url)

    if (res.status != 200) {
        throw new Error(`Unable to fetch admin group data`)
    }

    return res
}

export async function getAllDiscordRoles() {
    // const url = `${baseURL}/api/v1/allroles`
    const url = `/api/v1/allroles`
    const res = await axios.get(url)

    if (res.status != 200) {
        throw new Error(`Unable to fetch discord roles`)
    }

    return res.data
}

export async function postAdminGroups(adminGroups: AdminGroupRow[]) {

    return await axios.post(
        `/api/v1/admingroups`,
        {
            adminGroupRows: adminGroups
        }
    )
}

export async function getUsersWhitelist(): Promise<WhitelistResponseData> {
    const res = await axios.get(
        `/api/v1/user/whitelist`
    )

    if(res.status != 200) {
        throw new Error("Unable to fetch whitelist data.")
    }

    return res.data
}


export async function postUserWhitelists(whitelistRows: WhitelistRow[]) {
    // const url = `${baseURL}/api/v1/user/whitelist`
    const url = `/api/v1/user/whitelist`
    return axios.post(url, whitelistRows)
}

export async function postUserSteamID(steamID: string) {
    const url = `/api/v1/user/userid`
    const result = await axios.post(url, { steamID: steamID })
    // const result = await axios({
    //     url: url,
    //     method: "POST",
    //     data: { steamID: steamID },
    // })

    if (result.status != 200) {
        throw new Error("Unable to update user's steamID")
    }

    return result
}

export async function getUserSteamID() {
    return axios.get(`/api/v1/user/userid`)
}

export async function getPrivilegedDiscordRoles() {
    const res = await axios.get(`/api/v1/roles`)

    if(res.status != 200) {
        throw new Error("Unable to fetch privileged discord roles")
    }

    return res.data
}

export async function postPrivilegedDiscordRoles(roles: IPrivilegedRole[]) {
    const result = await axios.post(`/api/v1/roles`, roles)

    if (result.status != 200) {
        throw new Error("Unable to fetch privileged discord roles")
    }

    return result
}

export async function getListEndpoints() {
    const url = `/api/v1/listedit`
    const res = await axios.get(url)

    if (res.status != 200) {
        throw new Error(`Unable to fetch admin group data`)
    }

    return res.data
}

export async function postListEndpoints(lists: ListEndpoint[]) {
    const url = `/api/v1/listedit`
    const result = await axios.post(url, lists)

    if (result.status != 200) {
        throw new Error("Unable to post list data to server.")
    }

    return result
}

export async function fetchUserData(): Promise<UserResponseData> {
    const url = `/api/v1/user/info`
    const response = await fetch(url, {
        credentials: "include"
    })

    if (!response.ok) {
        throw new Error('Unable to fetch profile data.')
    }

    return response.json()
}







// export async function logoutRequest() {
//     const response = await axios.post(baseURL2 + "/auth/logout")
//
//     console.log(response)
//
//     if (response.status !== 200) {
//         throw new Error("Something went wrong when attempting to logout")
//     }
//
//     return response
//
// }
//
