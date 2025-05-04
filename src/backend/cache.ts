import {
    DiscordGuildUser,
    DiscordRoleToWebsiteRoleDB,
    DiscordUsersDB,
    IAdminGroup,
    IListEndpoint,
    IPrivilegedRole,
    ListsDB,
    RolesDB
} from "./database";
import {Client, GatewayIntentBits, GuildMember} from "discord.js";
import {defaultLogger, Logger, LoggingLevel} from "./logger";
import env from "./load-env";
import {DiscordRole, WebsitePermissions} from "../frontend/src/shared/shared-types";
import loadEnv from "./load-env";

/*
File responsible for handling caches of data, and initializing the discord and database clients.
TODO might want to factor out the initialization of discord and db to somewhere else that makes sense.
 */

const logger = new Logger(LoggingLevel.DEBUG)

let usersCache: Map<string, DiscordGuildUser> = new Map()
let listsCache: Map<string, string> = new Map()
export let allDiscordRolesCache: DiscordRole[] = []

export const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
})


/**
 * Refreshes the local cache with all discord users stored in the DB.
 * Returns a pointer to the users cache after the refresh has been performed.
 */
export async function refreshUsersCache(userData = null) {
    let discordUsers = userData ? userData : await DiscordUsersDB.find();

    usersCache.clear()
    for (const user of discordUsers) {
        usersCache.set(user.DiscordID, user)
    }
    return usersCache
}


export async function generateLists(listsData: IListEndpoint[], rolesData: IPrivilegedRole[], usersData: DiscordGuildUser[]) {
    const listsMap = new Map<string, string>()

    for (const lData of listsData) {
        const listFile = await constructListFile(lData, rolesData, usersData)
        listsMap.set(lData.ListName, listFile)
    }
    return listsMap
}


/**
 * Dynamically generates a permission list based on admin groups assigned to a specific list and discord roles.
 *
 * An admin group is a name mapped to a set of in-game permissions,
 * So for example, you could have an admin group with the name "Whitelist", with an array of permissions ["reserve"]
 * Which would give ever user with that permission whitelist/priority queue to the game server.
 *
 * For example, if a list has admin group "X" assigned to it,
 * then all users with a discord role that also has admin group "X"
 * assigned to it will get their adminID added to the list endpoint,
 * provided they have an adminID installed.

 * Additionally, if the list endpoint has the admin grouped marked with the "isWhitelistGroup" flag,
 * Then all users with roles that have whitelist slots will have their white
 *
 *
 * @param listData {IListEndpoint}
 * @param rolesData {IPrivilegedRole[]}
 * @param usersData {DiscordGuildUser[]}
 */
async function constructListFile(listData: IListEndpoint, rolesData: IPrivilegedRole[], usersData: DiscordGuildUser[]) {
    let fileBuffer: string[] = []
    let whitelistGroup: IAdminGroup | null = null
    let validDiscordRoles: IPrivilegedRole[] = []
    for (const group of listData.AdminGroups) {
        if (!group.Enabled) continue
        if (!group.Permissions.length) continue

        if (group.IsWhitelistGroup) {
            // @ts-ignore
            whitelistGroup = group
        }

        for (const role of rolesData) {
            if (role?.AdminGroup?.GroupName === group.GroupName) {
                validDiscordRoles.push(role)
            }
        }

        let permissions = group.Permissions.join(",")
        fileBuffer.push(`Group=${group.GroupName}:${permissions}`)
    }


    // TODO change this into using a timezone defined by either the .env or user specifiable timezone.
    // Equivalent to EST time, but need to add customizable timezones to the config file.
    let today = new Date(Date.now() - (60 * 60 - 1000 * 4))


    // TODO this almost certainly requires optimization.
    for (let user of usersData) {
        if (!user.Whitelist64IDs) {
            user.Whitelist64IDs = []
        }

        const usersValidRoles = getUsersValidRoles(user, validDiscordRoles)
        // console.log('User', user.DiscordName, 'valid roles: ', usersValidRoles)

        /*
        TODO
        Add "admin" role of user.
        Currently this solution is rather flawed, as it allows a user have multiple in game admin groups, which can cause issues.
        My current idea is to perhaps have "significance" levels to the admin groups, where your highest one decides your in-game permissions, active days etc.
         */

        if (user.UserID64?.steamID) {
            for (const role of usersValidRoles) {
                // Explicitly check against false, because we don't want to add the user if the "admingroup" is undefined.
                if (role?.AdminGroup?.IsWhitelistGroup === false) {
                    fileBuffer.push(`Admin=${user.UserID64.steamID}:${role.AdminGroup.GroupName} // ${user.DiscordName}`)
                }
            }
        }

        let whitelistProps: IUserProps = processWhitelistProps(user, validDiscordRoles)

        // TODO may have to find a better solution for active days, but currently it will just be the active days of their highest role.
        if (!whitelistGroup) {
            continue
        }

        if (whitelistProps.WhitelistActiveDays.includes(today.getDay())) {
            for (let i = 0; i < whitelistProps.WhitelistSlots; i++) {
                let id = user.Whitelist64IDs[i]?.steamID
                if (id) {
                    fileBuffer.push(`Admin=${id}:${whitelistGroup.GroupName} // Originator: ${user.DiscordName}`)
                }
            }
        }
    }

    return fileBuffer.join('\r\n')
}


/**
 * Generates new list endpoints based on the documents stored in the database,
 */
export async function refreshListCache() {
    // TODO use the caches instead here.
    defaultLogger.debug('Refreshing lists endpoint cache...')

    // TODO swap to using cache.
    const usersData = await DiscordUsersDB.find()
    const listsData = await ListsDB.find({
        Enabled: true,
    })
    const discordRolesData = await RolesDB.find()

    listsCache = await generateLists(listsData, discordRolesData, usersData)
}


export function getUsersFromCacheList(activeUsersOnly: boolean = true): DiscordGuildUser[] {
    const usersValues = usersCache.values()
    let users: DiscordGuildUser[]

    if (activeUsersOnly) {
        users = Array.from(usersValues).filter(user => user.Enabled)
    } else {
        users = Array.from(usersValues)
    }

    return users
}

export function getUsersCacheMap(activeUsers: boolean = true) {
    let users: Map<string, DiscordGuildUser> = new Map()

    if (activeUsers) {
        usersCache.forEach(user => {
            if (user.Enabled) {
                users.set(user.DiscordID, user)
            }
        })
    } else {
        users = usersCache
    }

    return users
}



export function getListsCache() {
    return listsCache
}


/**
 * Retrieves all discord members from all servers the bot has access to.
 */
async function retrieveAllDiscordMembers() {
    let allDiscordMembers: GuildMember[] = []
    try {
        for (let guild of discordClient.guilds.cache.values()) {
            const members = await guild.members.fetch()
            allDiscordMembers.push(...members.values())
        }
    } catch (e) {
        defaultLogger.error(`Discord client was unable to retrieve guilds.`)
    }

    return allDiscordMembers
}

/**
 * Retrieves all "members"(Discord Users) from a specific guild(Server).
 * @param guildID {string} id representing a single discord guild(Server)
 * @return discordMembers {GuildMember[]}
 */
async function retrieveMembersFromGuild(guildID: string) {
    let discordMembers: GuildMember[] = []

    try {
        let guild = discordClient.guilds.cache.get(guildID)
        const members = await guild?.members.fetch()
        if (members) {
            discordMembers.push(...members.values());
        }

    } catch (e) {
        defaultLogger.error(`Discord client was unable to retrieve members from guild ${guildID}`)
    }

    return discordMembers
}


export async function getDiscordRoles(guildID: string) {
    let discordRoles: DiscordRole[] = []
    let guild = await discordClient.guilds.fetch(guildID)
    try {
        const roles = await guild.roles.fetch()
        for (const role of roles.values()) {
            discordRoles.push({
                RoleID: role.id,
                RoleName: role.name,
                GuildID: role.guild.id
            })
        }
    } catch (e) {
        logger.error(`Discord client was unable to retrieve guild.`)
    }
    return discordRoles
}


export async function refreshDiscordRoles(guildID: string): Promise<DiscordRole[]> {
    allDiscordRolesCache = await getDiscordRoles(guildID)
    return allDiscordRolesCache
}


// Meant to be a rough analogue of the "performScrub" function of the old whitelist server.
export async function refreshDiscordGuildUsers(disableUsersNoLongerInGuild: boolean = true) {
    defaultLogger.debug('Performing scrub of users...')
    const members = await retrieveMembersFromGuild(env.discordGuildID)
    const enabledUsersIDs: string[] = []
    for (const member of members) {
        const memberRoles = member.roles.cache.map(role => role.id)
        const name = member.user.displayName ? member.user.displayName : member.user.username
        enabledUsersIDs.push(member.id)

        const newUser = await DiscordUsersDB.findOneAndUpdate({
            DiscordID: member.id
        }, {
            DiscordID: member.id, DiscordName: name, Roles: memberRoles, Enabled: true
        }, {
            upsert: true,
            runValidators: true
        }).exec()
    }

    if (disableUsersNoLongerInGuild) {
        // Find the users that are currently enabled but shouldn't be.
        let usersToScrub = await DiscordUsersDB.find({DiscordID: {$nin: enabledUsersIDs}, Enabled: true})

        // Disable inactive users.
        for (const user of usersToScrub) {
            await DiscordUsersDB.findOneAndUpdate({
                DiscordID: user.DiscordID
            }, {
                Enabled: false
            }).exec()
        }

        if (usersToScrub.length) {
           logger.debug(`Scrubbed users: ${usersToScrub.length}`)
        }
    }
}


/**
 * Utility function for retrieving all enabled/active users that has a special/privileged role.
 * A privileged/special role in the context of this project is any role that has an admin group mapped to it.
 */
export async function getAllUsersWithSpecialRoles() {
    let privilegedRoles = await RolesDB.find({Enabled: true})
    // A role is considered privileged/special if it has an admin group.
    privilegedRoles = privilegedRoles.filter(role => role?.AdminGroup)

    const specialUsers: DiscordGuildUser[] = []
    for (const user of usersCache.values()) {
        if (!user.Enabled) continue

        let hasValidRole = privilegedRoles.some(role => {
            return user.Roles.includes(role.RoleID);
        })

        if (hasValidRole) {
            specialUsers.push(user)
        }
    }

    return specialUsers
}


/**
 * Filters out the roles that a user has that are valid for a specific list.
 * @param user {DiscordGuildUser}
 * @param allValidRoles {IPrivilegedRole[]}
 * @return {IPrivilegedRole[]}
 */
function getUsersValidRoles(user: DiscordGuildUser, allValidRoles: IPrivilegedRole[]): IPrivilegedRole[] {
    return allValidRoles.filter(role => {
        return user.Roles.includes(role.RoleID)
    })
}


/**
 * Retrieves the permissions a user has on the website/backend based on their discord roles.
 * @param user
 */
export async function getDiscordUsersWebsitePermissions (user: DiscordGuildUser) {
    const allPermissions: WebsitePermissions[] = []

    // User is a "superadmin", they have all permissions on the website.
    if (user.Roles.includes(loadEnv.discordRolesAuthorizedForAdmin)) {
        allPermissions.push(WebsitePermissions.ADMINISTRATOR)
    }
    else {
        const userWebsiteRoles = await DiscordRoleToWebsiteRoleDB.find({
            DiscordRoleID: {$in: user.Roles}
        })
        for (const role of userWebsiteRoles) {
            if (role?.mappedWebsiteRole) {
                allPermissions.push(...role.mappedWebsiteRole.permissions)
            }
        }
    }

    return allPermissions
}



function generateAdminPermissionString(user: DiscordGuildUser) {

}


/**
 * Utility function to process how many slots whitelist slots and active days a user will have.
 *
 * @param user
 * @param discordRoles
 */
export function processWhitelistProps(user: DiscordGuildUser, discordRoles: IPrivilegedRole[]) {
    let userProps: IUserProps = { WhitelistSlots: 0, WhitelistActiveDays: []}

    for (const userRoleID of user.Roles) {
        for (const discordRole of discordRoles) {
            if (!(userRoleID === discordRole.RoleID)) {
                continue
            }

            if (userProps.WhitelistSlots < discordRole.WhitelistSlots) {
                userProps.WhitelistSlots = discordRole.WhitelistSlots
            }

            // TODO
            // This is intended to be a temp solution. It will effectively concatenate all the active days of a user, instead of grabbing their "highest"
            for (const day of discordRole.ActiveDays) {
                if (!userProps.WhitelistActiveDays.includes(day)) {
                    userProps.WhitelistActiveDays.push(day)
                }
            }
        }
    }

    return userProps
}


interface IUserProps {
    WhitelistSlots: number,
    WhitelistActiveDays: number[]
    // TODO add "admin" or singificance number here.
}


