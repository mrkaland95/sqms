import { readdirSync } from "fs";
import path from "path";
import {ExpressRoute} from "../types";


/**
 * Recursively loads all route files from the specified root path.
 * @param routesPath
 */
export async function loadRoutes(routesPath: string) {
    const fileRoutes = readdirSync(
        routesPath, {
        withFileTypes: true,
        recursive: true
    })

    let routes: ExpressRoute[] = []
    for (const file of fileRoutes) {
        if (!file.isFile()) continue
        if (!file.name.endsWith('.ts') && !file.name.endsWith('.js')) continue
        if (file.name.includes('main')) continue
        const filePath = path.join(file.path, file.name)
        // console.log(filePath)
        const route = require(filePath)?.default
        // TODO add check for actual content of route here.
        if (route) {
            routes.push(route)
        }
    }

    return routes
}