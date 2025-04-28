import {IRoute, Router} from "express";

import {AdminGroupsDB} from "../../../database";
import {isAuthenticated} from "../../utils/utils";
import {defaultLogger} from "../../../logger";


const router = Router()


router.use((req, res, next) => {
    defaultLogger.debug(`Received request for route: ${req.url}`);
    next()
})


router.get('/', isAuthenticated, async (req, res) => {
    if (!req.session?.discordUser) {
        res.sendStatus(500)
        return
    }
    // TODO add authorization for this route.

    defaultLogger.debug(`Fetching roles from DB...`)
    const roles = await AdminGroupsDB.find()

    res.json(roles)
})


router.post('/', isAuthenticated, async (req, res) => {
    if (!req.session?.discordUser) {
        res.sendStatus(500)
        return
    }

    // TODO add authorization for this route.
    const groups = req.body?.adminGroupRows
    if (!(groups instanceof Array)) {
        res.sendStatus(400)
        return
    }


    for (const elem of groups) {
        try {
            if (!elem.GroupID) {
                elem.GroupID = crypto.randomUUID()
            }

            const res = await AdminGroupsDB.findOneAndUpdate({
                GroupID: elem.GroupID,
            }, {
                GroupID: elem.GroupID,
                GroupName: elem.GroupName,
                Enabled: elem.Enabled,
                Permissions: elem.Permissions,
                IsWhitelistGroup: false
            }, {
                upsert: true,
                new: true,
                runValidators: true
            })
        } catch (err) {
            console.log(err)
            // defaultLogger.error(err)
            res.sendStatus(500)
            return
        }
    }

    res.sendStatus(200)
})


router.delete('/:group',  async (req, res) => {
    if (!req.session?.discordUser) {
        res.sendStatus(500)
        return
    }

    if (!req.body?.id) {
        res.sendStatus(400)
        return
    }
    try {
        await AdminGroupsDB.deleteOne({GroupID: req.body.id})
    } catch (e) {
        defaultLogger.error(`Error when deleting role: `, e)
        res.sendStatus(500)
        return
    }

    res.sendStatus(200)
})



export default { router: router }