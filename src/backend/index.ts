import {Events, GatewayIntentBits} from "discord.js";
import 'dotenv/config'
import webServerStart from "./web-server";
import env from "./load-env";
import {
    discordClient,
    getAllUsersWithSpecialRoles, getUsersFromCacheList, getDiscordRoles,
    refreshDiscordUsersAndRoles,
    refreshListCache,
    refreshUsersCache, refreshDiscordRoles
} from "./cache";
import mongoose from "mongoose";
import {Logger, LoggingLevel} from "./logger";
import {initializeWhitelistGroup} from "./database";


/*
Main entry point, initializes the web server, bot etc.
 */


const logger = new Logger(LoggingLevel.DEBUG)


async function main() {
    logger.info("Booting up whitelist management server...")
    await webServerStart()
    await mongoose.connect(env.mongoDBConnectionString)
    await discordClient.login(env.discordAppToken)

    await initializeWhitelistGroup()
    // await refreshListCache()
    // await refreshDiscordRoles(env.discordGuildID)

    await updateCaches()

    setInterval(updateCaches, 60 * 1000)
}


async function updateCaches() {
    await refreshUsersCache()
    await refreshDiscordRoles(env.discordGuildID)
    await refreshDiscordUsersAndRoles()
    await refreshListCache()
}


main()