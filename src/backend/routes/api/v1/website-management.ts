import {Router} from "express";
import loadEnv from "../../../load-env";
import {isAuthenticated} from "../../utils/utils";
import {defaultLogger} from "../../../logger";
import {WebsiteRolesDB} from "../../../database";
import {getUsersFromCacheList, getUsersCacheMap} from "../../../cache";

loadEnv.discordRolesAuthorizedForAdmin


const router = Router()

/**
 * Handle routes for managing website roles & mapping them to discord roles.
 */


router.get('/', isAuthenticated, (req, res) => {
    // req.session.discordUser


    console.log("test")
    res.send("Successfull").status(200)
})


router.get('/website-roles/', isAuthenticated, async (req, res) => {
    const userID = req.session.discordUser?.id

    if (!userID) {
        res.sendStatus(401)
        return
    }

    // Fetch the requester's discord data from the cache
    const user = getUsersCacheMap().get(userID)
    if (!user) {
        res.sendStatus(401)
        return
    }

    // User is not a "superadmin"
    if (!user.Roles.includes(loadEnv.discordRolesAuthorizedForAdmin)) {
        res.sendStatus(401)
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


export default { router: router }
