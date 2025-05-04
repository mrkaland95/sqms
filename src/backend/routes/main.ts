import {NextFunction, response, Router} from "express";
import env from "../load-env";
import {DiscordAPIUser} from "../utils/types";
import {defaultLogger, Logger, LoggingLevel} from "../logger";
import {accessTokenData, isAuthenticated, requestAccessToken, requestDiscordUserData} from "./utils/utils";
import {getUsersFromCacheList, getUsersCacheMap, processWhitelistProps} from "../cache";
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
        logger.debug('Received request from logged in user.')
        res.redirect('http://localhost:3000/');
        return
    }

    if (req.ip != null) {
        logger.debug(`Received request from unauthenticated user. IP:`, req.ip)
    } else {
        logger.debug('Received request from unauthenticated user.')
    }

    res.status(401).send('User was not logged in')
})


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


    defaultLogger.debug(`[${req.method} ${req.originalUrl}]_[${res.statusCode} - ${duration}ms]_[IP: ${ip}]_[User-Agent: ${req.headers['user-agent']}]`)
    next()
}


export default router
