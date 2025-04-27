import 'express-session'

import { Router } from "express";
import {ClientUser} from "discord.js";

declare module 'express-session' {
    interface SessionData {
        discordUser: DiscordUser
        isAuthenticated: boolean
        user: any
        oAuthState?: string
    }
}


/**
 * Represents the values you get in the response from the discord API when you send a request with the "identify" scope.
 * Retrieved from here:
 * https://discord.com/developers/docs/resources/user
 *
 * Do note that a (Global) Discord User is *not* the same thing as a "GuildMember" used to the rest of discordjs.
 * A GuildMember represents a user in that specific server("guild).
 */
export type DiscordUser = {
    id: string,
    username: string,
    discriminator: string,
    global_name: string | null,
    avatar: string | null,
    bot?: boolean,
    system?: boolean,
    mfa_enabled?: boolean,
    banner?: string | null,
    accent_color?: number | null,
    locale?: string,
    flags?: number,
    premium_type?: number,
    public_flags: number
}

export type ExpressRoute = {
    name: string
    router: Router
}