import {Router} from "express";
import {accessTokenRequestSuccess, requestAccessToken, requestDiscordUserData} from "../../utils/utils";
import env from "../../../load-env";
import {DiscordUser} from "../../../utils/types";
import {defaultLogger} from "../../../logger";


const router = Router()


router.get('/login', async (req, res) => {
    const { code } = req.query

    defaultLogger.debug(`Received login request from user with IP: ${req.ip}`)

    // TODO this needs to render the base document if on a live/staging environment.
    if (req.session?.discordUser) {
        defaultLogger.debug(`request had a user on session.`)
        res.redirect('/')
        return
    }

    if (!code) {
        defaultLogger.debug('User has no code')
        res.status(400).send('No authorization code included.')
        return
    }

    let redirectURI = `http://localhost:5000/api/v1/auth/login`

    const accessTokenRequest = await requestAccessToken(String(code), env.discordOauth2ClientPublic, env.discordOauth2ClientSecret, redirectURI)

    if (accessTokenRequest.body?.error_description === 'Invalid "redirect_uri" in request.') {
        res.sendStatus(500)
        throw new Error(`Invalid "redirect_uri" in environment.`)
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


router.get('/redirect', (req, res) => {
    res.redirect('https://discord.com/oauth2/authorize?client_id=1093586781703786526&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fv1%2Fauth%2Flogin&scope=identify')
})


router.post('/logout', async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error when destroying session: ", err)
            res.status(500).send('Internal server error')
        } else {
            defaultLogger.debug(`Succesfully logged out user.`)
            res.status(200).send('OK')
        }
    })
})


export default {router: router }