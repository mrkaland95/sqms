
/**
 * This file defines types that are shared between the frontend and backend.
 */


/*
Pulled and defined from:
https://squad.fandom.com/wiki/Server_Administration
 */


import {IDiscordRole} from "../backend/database";

export enum InGameAdminPermissions {
    CHANGE_MAP = "changemap",
    CAN_SEE_ADMIN_CHAT = "canseeadminchat",
    BALANCE = "balance",
    PAUSE = "pause",
    CHEAT = "cheat",
    PRIVATE = "private",
    CAN_USE_ADMIN_CHAT = "chat",
    KICK = "kick",
    BAN = "ban",
    CONFIG = "config",
    IMMUNE = "immune",
    MANAGE_SERVER = "manageserver",
    CAMERAMAN = "cameraman",
    FEATURE_TEST = "featuretest",
    FORCE_TEAM_CHANGE = "forceteamchange",
    RESERVE = "reserve",
    DEBUG = "debug",
    TEAM_CHANGE = "teamchange"
}

/*
A week day corresponding to a number, particularly to inbuilt Javascript
Date.getDay() method.
 */
export enum WeekDays {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}

export interface DiscordUser {
    DiscordID: string;
    DiscordName: string;
    Roles: string[];
    Whitelist64IDs: { steamID: string; name?: string }[];
    UserID64?: { steamID: string; isLinkedToSteam: boolean};
    Enabled: boolean;
}

export interface AdminGroup {
    GroupID: string;
    GroupName: string,
    Permissions: [InGameAdminPermissions],
    Enabled: boolean,
    IsWhitelistGroup: boolean
}


export interface ListEndpoint {
    ListName: string,
    ListID: string,
    AdminGroups: AdminGroup[],
    AllRolesEnabled: boolean,
    UseWhitelistGroup: boolean,
    Enabled: boolean
}


export interface PrivilegedRole {
    RoleID: string,
    RoleName: string,
    AdminGroup?: AdminGroup,
    ActiveDays: [WeekDays],
    WhitelistSlots: number
    Enabled: boolean
}


export interface Log {
    LogMessage: string,
    MessageType?: string,
}

export type LogTypes = {

}


export interface DiscordRole {
    RoleID: string,
    RoleName: string,
    GuildID: string
}

export interface APIKey {
    APIKey: string
}

export interface UserResponseData {
    isAuthenticated: boolean,
    isAdmin: boolean,
    discordUserName: string,
    discordAvatar: string,
    discordGlobalName: string,
    userPrivilegedDiscordRoles: IDiscordRole[]
    userSteamID: string
    userWhitelistSlots: number
    userWhitelistActiveDays: WeekDays[]
    userWhitelistedSteam64IDs: { steamID: string, name?: string }[]
}

export interface WebsiteRole {
    roleID: string
    name: string
    permissions: WebsitePermissions[]
}

export enum WebsitePermissions {
    ALL = '*',
    GAME_SERVER_PERMISSIONS_MANAGE = 'game_server_permissions_manage'
    // GAME_SERVER_PERMISSIONS_VIEW = 'GAME_SERVER_PERMISSIONS_VIEW',
    // GAME_SERVER_PERMISSIONS_CREATE = 'GAME_SERVER_PERMISSIONS_CREATE',



}