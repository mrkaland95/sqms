import {Router} from "express";
import loadEnv from "../../../load-env";
import {isAuthenticated, userHasPermission} from "../../utils/utils";
import {defaultLogger} from "../../../logger";
import {DiscordRoleToWebsiteRoleDB, WebsiteRolesDB} from "../../../database";
import {getUsersCacheMap, getDiscordUsersWebsitePermissions} from "../../../cache";
import {WebsitePermissions, WebsiteRole} from "../../../../frontend/src/shared/shared-types";

const router = Router()
const requiredPermission = WebsitePermissions.ADMINISTRATOR


/**
 * Handle routes for managing website roles and mapping them to discord roles.
 */

router.get('/role-mapping/', isAuthenticated, async (req, res) => {
    const userID = req.session.discordUser?.id

    if (!userID) {
        res.sendStatus(401)
        return
    }
    const hasPermission = await userHasPermission(userID, requiredPermission)

    if (!hasPermission) {
        res.sendStatus(403)
        return
    } else {
        const mappedRoles = await DiscordRoleToWebsiteRoleDB.find().populate('mappedWebsiteRole')
        console.log(mappedRoles)
        res.json(mappedRoles)
        return
    }
})

router.post('/role-mapping/', isAuthenticated, async (req, res) => {
    const userID = req.session.discordUser?.id

    if (!userID) {
        res.sendStatus(401)
        return
    }

    const hasPermission = await userHasPermission(userID, requiredPermission)
    if (!hasPermission) {
        res.sendStatus(403)
        return
    }

    const { data } = req.body

    if (!data) {
        defaultLogger.warning("Invalid data received from authorized client.")
        res.sendStatus(400)
    }

    // Sort of verify data integrity
    // a Very lazy solution for now, just checks that the received data contains the correct fields
    for (const elem of data) {
        const { discordRoleID, mappedWebsiteRole, permissionID } = elem
        if (!discordRoleID || !permissionID) {
            defaultLogger.critical("Invalid data received from client.")
            defaultLogger.critical(elem)
            res.sendStatus(400)
            return
        }

        if (!mappedWebsiteRole) continue

        try {
            const foundRole = await WebsiteRolesDB.findOneAndUpdate({
                    roleID: mappedWebsiteRole?.roleID
                }, {
                    roleID: mappedWebsiteRole.roleID,
                    roleName: mappedWebsiteRole.roleName,
                    description: mappedWebsiteRole.description,
                    permissions: mappedWebsiteRole.permissions,
                },
                {
                    upsert: true,
                    new: true,
                }).exec()

        } catch (e) {
            defaultLogger.critical(e)
            res.sendStatus(500)
            return
        }
    }

    for (const elem of data) {
        const { discordRoleID, mappedWebsiteRole, permissionID } = elem

        try {
            await DiscordRoleToWebsiteRoleDB.findOneAndUpdate({
                permissionID: permissionID,
            }, {
                permissionID: permissionID,
                discordRoleID: discordRoleID,
                mappedWebsiteRole: mappedWebsiteRole,
            }, {
                upsert: true,
                runValidators: true,
                new: true
                }
            ).exec()
        } catch (e) {
            defaultLogger.critical(e)
            res.sendStatus(500)
            return
        }
    }

    res.sendStatus(200)
})

router.delete('/role-mapping/:id', isAuthenticated, async (req, res) => {
    const userID = req.session.discordUser?.id
    if (!userID) {
        res.sendStatus(401)
        return
    }

    const hasPermission = await userHasPermission(userID, requiredPermission)
    if (!hasPermission) {
        res.sendStatus(403)
        return
    }
    const { id } = req.params
    if (!id) {
        res.sendStatus(400)
    }
    try {
        const result = await DiscordRoleToWebsiteRoleDB.deleteOne({
            permissionID: id
        })
        res.sendStatus(200)
    } catch (e) {
        defaultLogger.critical(e)
        res.sendStatus(500)
        return
    }
})

router.get('/website-roles/', isAuthenticated, async (req, res) => {
    const userID = req.session.discordUser?.id

    if (!userID) {
        res.sendStatus(401)
        return
    }

    const hasPermission = await userHasPermission(userID, requiredPermission)

    if (!hasPermission) {
        res.sendStatus(403)
        return
    }

    try {
        const result = await WebsiteRolesDB.find()
        res.json(result)
    } catch (e) {
        defaultLogger.error("Error when fetching website roles: ", e)
        res.sendStatus(500)
        return
    }
})

router.post('/website-roles/', isAuthenticated, async (req, res) => {
    const userID = req.session.discordUser?.id

    if (!userID) {
        res.sendStatus(401)
        return
    }

    const hasPermission = await userHasPermission(userID, requiredPermission)
    if (!hasPermission) {
        res.sendStatus(403)
        return
    }

    const { data } = req.body

    if (!data) {
        defaultLogger.warning("Invalid data received from authorized client, first step.")
        defaultLogger.warning(data)
        res.sendStatus(400)
    }

    // Validate data, sort of. Should be replaced by something else at some point.
    for (const elem of data) {
        const { roleID, roleName, description, permissions } = elem
        if (!roleID || !roleName || permissions !== undefined && !Array.isArray(permissions)) {
            defaultLogger.warning("Invalid data received from authorized client.")
            defaultLogger.warning(elem)

            res.sendStatus(400)
            return
        }
        if (WebsitePermissions.ADMINISTRATOR in permissions) {
            elem.permissions = [WebsitePermissions.ADMINISTRATOR]
        }
    }

    const roleData = (data as WebsiteRole[])

    for (const elem of roleData) {
        try {
            const { roleID, roleName, description, permissions } = elem

            const result = await WebsiteRolesDB.findOneAndUpdate({
                roleID: roleID
            }, {
                roleID: roleID ? roleID : crypto.randomUUID(),
                roleName: roleName,
                description: description,
                permissions: permissions,
            }, {
                new: true,
                runValidators: true,
                upsert: true,
                setDefaultsOnInsert: true

            }).exec()
            console.log(result)
        } catch (e) {
            defaultLogger.info(e)
            res.sendStatus(500)
            return
        }
    }
    res.sendStatus(200)
})

router.delete('/website-roles/:roleID', isAuthenticated, async (req, res) => {
    const userID = req.session.discordUser?.id
    if (!userID) {
        res.sendStatus(401)
        return
    }

    const hasPermission = await userHasPermission(userID, requiredPermission)
    if (!hasPermission) {
        res.sendStatus(403)
        return
    }

    const { roleID } = req.params
    if (!roleID) {
        res.sendStatus(400)
    }

    try {
        const result = await WebsiteRolesDB.deleteOne({
            roleID: roleID
        })
        res.sendStatus(200)
    } catch (e) {
        defaultLogger.critical(e)
        res.sendStatus(500)
        return
    }
})


export default { router: router }
