import React from 'react';
import { useQuery } from '@tanstack/react-query';
// import {IDiscordRole} from "../../../../dist/backend/schema";


async function fetchUserData(): Promise<responseData> {
    const response = await fetch("/api/v1/api/v1/user/userinfo", {
        credentials: "include"
    })

    if (!response.ok) {
        throw new Error('Unable to fetch profile data.')
    }

    return response.json()
}


function Profile() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['userdata'],
        queryFn: fetchUserData,
    });

    // TODO add loading modal here.
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!data) return <p>Something went wrong when loading profile data</p>

    return(
        <div className={"profile-div"}>
            <h1 style={{paddingBottom: '20px'}}>Profile for {data.globalName}</h1>
            <p></p>
            <a className="default-button" href="/user">test</a>
            <a className="default-button" href="/whitelists">test</a>
            {/*<div></div>*/}
            {/*<button className="default-button">Edit whitelist</button>*/}
            {/*<button className="default-button">Edit User's personal steamID</button>*/}
        </div>
    )
}



export type responseData = {
    isAuthenticated: boolean,
    isAdmin: boolean
    username: string,
    globalName: string
    avatar: string
    usersValidRoles: IDiscordRole[]
}

export interface IDiscordRole {
    RoleID: string,
    RoleName: string,
    GuildID: string
}

export default Profile