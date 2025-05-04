import express, {NextFunction, Request, Response} from 'express';
import session from 'express-session'
import env from './load-env'
import {loadRoutes, loadRoutes2} from "./utils/utils";
import path from "path";
import mainRouter, {loggingMiddleware} from "./routes/main";
import MongoStore from "connect-mongo";
import cors from 'cors';
import {defaultLogger, Logger, LoggingLevel} from "./logger";


const app = express()
app.use(express.json())
app.use(session({
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: env.mongoDBConnectionString}),
    cookie: {
        maxAge: (1000 * 60 * 60) * env.cookieMaxAgeHours
    },
    secret: env.sessionSecret
}))

app.use(express.urlencoded({
        extended: true
    })
)

app.use(cors({
    origin: `http://localhost:3000`,
    credentials: true
}))

app.use(loggingMiddleware)

// TODO add logging level from .env file
const logger = new Logger(LoggingLevel.INFO, true)

async function webServerMain() {
    defaultLogger.info(`Initializing web server on port: "${env.webPort}"`)
    const routesPath = path.join(__dirname, 'routes')

    defaultLogger.info('Loading main router...')
    app.use(mainRouter)

    const routes = loadRoutes2(routesPath)
    defaultLogger.info('Loading secondary routers...')
    for (const route of routes) {
        defaultLogger.info(`Loading base route, ${route.baseRoute}, route name: ${route.routeName}`)
        const baseRoute = `${route.baseRoute}/${route.routeName}`
        app.use(baseRoute, route.router)
    }

    app.listen(env.webPort, () => {
        logger.info(`Web server up and running on port: ${env.webPort}`)
    })
}


async function logMiddleFunction(req: Request, res: Response, next: NextFunction) {
    // req.
}


export default webServerMain
