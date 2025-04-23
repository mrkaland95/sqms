import {NextFunction, response, Router} from "express";
import env from "../load-env";
import {DiscordUser} from "../utils/types";
import {defaultLogger, Logger, LoggingLevel} from "../logger";
import {accessTokenRequestSuccess, isAuthenticated, requestAccessToken, requestDiscordUserData} from "./utils/utils";
import {getUsersFromCacheList, GetUsersFromCacheMap, processWhitelistProps} from "../cache";
import {AdminGroupsDB, DiscordUsersDB, IDiscordRole, IPrivilegedRole, RolesDB} from "../database";
import {getPlayerSummarySteam} from "../utils/steamAPI";
import user from "./api/v1/user";

/*
This is the main router.
 */

const router: Router = Router()


const logger = new Logger(LoggingLevel.INFO, true)


router.get('/', async (req, res) => {
    if (req.session?.discordUser) {
        // res.send('Hello, World!')
        res.redirect('http://localhost:3000/');
        logger.debug('Received request from logged in user.')
        return
    }

    if (req.ip != null) {
        logger.debug(`Received request from unauthenticated user. IP:`, req.ip)
    } else {
        logger.debug('Recieved request from unauthenticated user.')
    }

    res.status(401).send('User was not logged in')
})


// router.get('/api/auth/userinfo', async (req, res) => {
//     logger.debug('Recieved user info request...', req.originalUrl)
//
//     if (!req.session.discordUser?.id) {
//         // res.status(401).send('User not authenticated')
//         // TODO temp
//         logger.debug(`Received request with no session.`)
//         res.status(401).send('Unauthenticated User')
//         return
//     }
//
//     const userDBData = GetUsersFromCacheMap(true).get(req.session.discordUser.id)
//     const rolesDBData = await RolesDB.find()
//
//     if (!userDBData) {
//         logger.debug(`Not able to find user with stored session ${req.session.discordUser.global_name} in DB`)
//         res.status(401).send('Unable to find user in the servers systems.')
//         return
//     }
//
//     const validRoles = rolesDBData.filter(role => {
//         return userDBData.Roles.includes(role.RoleID)
//     })
//
//     const isAdmin = userDBData.Roles.some(roleID => {
//         return env.discordRolesAuthorizedForAdmin.includes(roleID)
//     })
//
//     const whitelistProps = processWhitelistProps(userDBData, validRoles)
//
//     const responseData = {
//         isAuthenticated: true,
//         isAdmin: isAdmin,
//         discordUserName: req.session.discordUser.username,
//         discordGlobalName: req.session.discordUser.global_name,
//         discordAvatar: req.session.discordUser.avatar,
//         userPrivilegedDiscordRoles: validRoles,
//         userSteamID: userDBData.UserID64,
//         whitelistSlots: whitelistProps.WhitelistSlots,
//         whitelistActiveDays: whitelistProps.WhitelistActiveDays,
//         whitelistedSteam64IDs: userDBData.Whitelist64IDs,
//
//     }
//     logger.debug(`Sending profile response data...`)
//     res.status(200).json(responseData)
// })


// router.post('/api/profile/whitelist', isAuthenticated, async (req, res) => {
//     if (!req.session?.discordUser) {
//         logger.error(`"Is authenticated" function did not catch unauthenticated user before hitting the "/api/profile/whitelist" route.`)
//         res.send('Internal Server Error')
//         return
//     }
//
//     let body = req.body
//
//     logger.debug(`Whitelist update: `, body)
//
//     if (!(body instanceof Array)) {
//         res.status(400).send()
//         return
//     }
//
//     logger.debug(`Whitelist update, valid array...`)
//
//     let invalidData = false
//     for (const elem of body) {
//         if (!elem?.steamID) {
//             invalidData = true
//         }
//         if (!elem?.name) {
//             elem.name = ''
//         }
//     }
//     if (invalidData) {
//         res.status(400).send()
//         return
//     }
//
//     logger.debug(`Whitelist update, valid data, adding to db...`)
//
//     const dbRes = await DiscordUsersDB.findOneAndUpdate({
//         DiscordID: req.session.discordUser.id
//     }, {
//         Whitelist64IDs: body
//     }, {
//         runValidators: true,
//         upsert: true
//     }).exec()
//
//     logger.debug(`Successfully added steamIDs to db.`)
//
//     res.status(200).json({success: true})
// })





export type WhitelistResponseData = {
    isAuthenticated: boolean,
    validRoles: IPrivilegedRole[],
    whitelistSlots: number,
    whitelistActiveDays: number[],
    whitelistedSteam64IDs: {
        steamID:string
        name?: string,
    }[],
    userSteamID?: {
        steamID: string,
        isLinkedToSteam: boolean
    }
}

type WhitelistRow = {
    steamID: string
    name?: string
}



// @ts-ignore
async function requiredAuthentication(req, res, next) {

}

// @ts-ignore
async function logRequest(req, res, next) {

}

export async function loggingMiddleware(req: any, res: any, next: any) {
    const start = Date.now();

    let ip = req.ip
    if (ip.substring(0, 7) === '::ffff:') {
        ip = ip.substring(7)
    }

    const duration = Date.now() - start;

    //     console.log(`[${new Date().toISOString()}]_[${req.method} ${req.originalUrl}]_[${res.statusCode} - ${duration}ms]_[IP: ${ip}]_[User-Agent: ${req.headers['user-agent']}]`);
    // });


    defaultLogger.debug(`_[${req.method} ${req.originalUrl}]_[${res.statusCode} - ${duration}ms]_[IP: ${ip}]_[User-Agent: ${req.headers['user-agent']}]`)
    next()
}


export default router
