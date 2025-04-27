import {Router} from "express";
import {accessTokenRequestSuccess, requestAccessToken, requestDiscordUserData} from "../../utils/utils";
import env from "../../../load-env";
import {DiscordUser} from "../../../utils/types";
import {defaultLogger} from "../../../logger";


const router = Router()

/**
 * Route that initializes the login process. Redirects the user to discord for authentication.
 */
router.get('/redirect', (req, res) => {
    const redirectURL = new URL('https://discord.com/oauth2/authorize?client_id=1093586781703786526&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fv1%2Fauth%2Flogin&scope=identify')

    const query = req.query
    const { state } = query

    if (state && typeof state === 'string') {
        redirectURL.searchParams.set('state', state)
        req.session.oAuthState = String(state)
        req.session.save()
        res.redirect(redirectURL.href)
    } else {
        res.sendStatus(400)
    }
})


router.get('/login', async (req, res) => {
    const { code, state } = req.query
    const redirectURL = new URL(`http://localhost:5000/api/v1/auth/login`)

    defaultLogger.debug(`Received login request from user with IP: ${req.ip}`)

    if (req.session?.discordUser) {
        defaultLogger.debug(`Login request had a user on session.`)
        res.redirect('/')
        return
    }

    if (!code) {
        defaultLogger.debug('User has no code')
        res.status(400).send('No authorization code included.')
        return
    }

    if (!state || state !== req.session.oAuthState) {
        defaultLogger.debug("User has invalid state parameter")
        res.status(400).send('Invalid state parameter.')
        return
    }

    // Don't need the state parameter anymore, remove it from the session.
    delete req.session.oAuthState

    const accessTokenRequest = await requestAccessToken(String(code), env.discordOauth2ClientPublic, env.discordOauth2ClientSecret, redirectURL.href)
    console.log(accessTokenRequest)

    // Implies the discord redirect URL taken in from the environment variable is invalid and will not work with the API.
    if (accessTokenRequest.body?.error_description === 'Invalid "redirect_uri" in request.') {
        res.sendStatus(500)
        throw new Error(`Invalid "redirect_uri" in environment. `)
    }

    if (accessTokenRequest.body?.error_description === 'Invalid "code" in request.') {
        res.sendStatus(400)
        return
    }

    if (accessTokenRequest.statusCode !== 200) {
        defaultLogger.debug(`Unable to authenticate user`)
        res.sendStatus(500)
        return
    }

    // If the status code was 200, it means the request was a success, and we can cast it.
    const accessTokenData = (accessTokenRequest.body as accessTokenRequestSuccess)
    let discordUser: DiscordUser

    try {
        discordUser = await requestDiscordUserData(accessTokenData)
    } catch (e) {
        res.status(401).send('Unsuccessfully authenticated')
        req.session.destroy(() => {})
        return
    }

    const name = discordUser.global_name ? discordUser?.global_name : discordUser.username
    defaultLogger.info(`Discord user "${name}" succesfully logged in.`)
    req.session.discordUser = discordUser
    req.session.isAuthenticated = true
    req.session.save()
    res.redirect('http://localhost:3000/')
})





router.post('/logout', async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            defaultLogger.error("Error when destroying session: ", err)
            res.status(500).send('Internal server error')
        } else {
            defaultLogger.debug(`Succesfully logged out user.`)
            res.status(200).send('OK')
        }
    })
})


export default {router: router }