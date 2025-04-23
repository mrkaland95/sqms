import {Router} from "express";
import {isAuthenticated} from "../../utils/utils";
import {AdminGroupsDB, AllServerRolesDB, RolesDB} from "../../../database";
import {PrivilegedRole} from "../../../../shared-types/shared-types";
import {defaultLogger} from "../../../logger";


const router = Router()

// TODO add authorization for this route.
router.get('/', isAuthenticated, async (req, res) => {
    if (!req.session?.discordUser) {
        res.sendStatus(500)
        return
    }

    const privilegedRoles = await RolesDB.find()

    res.json(privilegedRoles)
})

// TODO add authorization for this route.
router.post('/', isAuthenticated, async (req, res) => {
    if (!req.session?.discordUser) {
        res.sendStatus(500)
        return
    }

    let body = req.body
    if (!(body instanceof Array)) {
        res.sendStatus(400)
        return
    }

    const specialRoles: PrivilegedRole[] = (body as PrivilegedRole[])
    const adminGroups = await AdminGroupsDB.find()

    try {
        for (const role of specialRoles) {
            let group
            if (!role?.AdminGroup) {
                group = undefined;
            } else {
                group = adminGroups.find((adminGroup) => {
                    return adminGroup.GroupName === role.AdminGroup?.GroupName;
                });
            }

            if (group) {
                await RolesDB.findOneAndUpdate({
                    RoleID: role.RoleID,
                }, {
                    RoleID: role.RoleID,
                    RoleName: role.RoleName,
                    ActiveDays: role.ActiveDays,
                    AdminGroup: group,
                    WhitelistSlots: role.WhitelistSlots,
                    Enabled: role.Enabled,
                }, {
                    runValidators: true,
                    upsert: true,
                    setDefaultsOnInsert: true
                }).exec()
            } else {
                await RolesDB.findOneAndUpdate({
                    RoleID: role.RoleID,
                }, {
                    RoleID: role.RoleID,
                    RoleName: role.RoleName,
                    ActiveDays: role.ActiveDays,
                    WhitelistSlots: role.WhitelistSlots,
                    Enabled: role.Enabled,
                }, {
                    runValidators: true,
                    upsert: true,
                    setDefaultsOnInsert: true
                }).exec()
            }
        }
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
        return
    }

    res.sendStatus(200)
})


export default { router: router }




