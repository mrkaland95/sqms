// import {IDiscordRole} from "../backend/database";

/**
 * This file defines types that are shared between the frontend and backend.
 */

/*
Pulled and defined from:
https://squad.fandom.com/wiki/Server_Administration
 */
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
A week day corresponding to a number,
specifically to the inbuilt Javascript Date.getDay() method.
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

/**
 * Represents a user in the discord server.
 */
export interface DiscordServerUser {
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

/**
 * Represents the data sent to a user on the front end.
 */
export interface UserResponseData {
    isAuthenticated: boolean,
    isAdmin: boolean,
    discordUserName: string, // A user's unique discord username
    discordAvatar: string, // An identifier used to retrieve their avatar from the discord API
    discordGlobalName: string, // A user's global display name
    userPrivilegedDiscordRoles: DiscordRole[]
    userSteamID: string
    userWhitelistSlots: number
    userWhitelistActiveDays: WeekDays[]
    userWhitelistedSteam64IDs: { steamID: string, name?: string }[]
    websitePermissions?: WebsitePermissions[]
}


export interface PermissionMapping {
    permissionID: string,
    discordRoleID: string,
    mappedWebsiteRole: WebsiteRole
}

export interface WebsiteRole {
    roleID: string
    roleName: string
    description: string
    permissions: WebsitePermissions[]
}

export enum WebsitePermissions  {
    ALL = '*',
    GAME_SERVER_PERMISSIONS_VIEW = 'game_server_permissions:view',
    GAME_SERVER_PERMISSIONS_EDIT = 'game_server_permissions:edit',
    GAME_SERVER_PERMISSIONS_DELETE = 'game_server_permissions:delete',
}

export const WebsitePermissionMetadata: Record<WebsitePermissions, {
    label: string;
    description: string;
    category?: string;
}> = {
    [WebsitePermissions.ALL]: {
        label: 'All Permissions',
        description: 'Grants all permissions on the website.',
        category: 'General',
    },
    [WebsitePermissions.GAME_SERVER_PERMISSIONS_VIEW]: {
        label: 'View Game Server Permissions',
        description: 'Allows viewing of game server permission settings.',
        category: 'Game Server',
    },
    [WebsitePermissions.GAME_SERVER_PERMISSIONS_EDIT]: {
        label: 'Edit Game Server Permissions',
        description: 'Allows creating or editing game server permission rules.',
        category: 'Game Server',
    },
    [WebsitePermissions.GAME_SERVER_PERMISSIONS_DELETE]: {
        label: 'Delete Game Server Permissions',
        description: 'Allows deletion of game server permission rules.',
        category: 'Game Server',
    },
};