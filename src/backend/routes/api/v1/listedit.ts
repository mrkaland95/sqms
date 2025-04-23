import {Router} from "express";
import {isAuthenticated} from "../../utils/utils";
import {ListsDB} from "../../../database";
import {ListEndpoint} from "../../../../shared-types/shared-types";
import {defaultLogger} from "../../../logger";
import {refreshListCache} from "../../../cache";

const router = Router()

router.get('/', isAuthenticated, async (req, res) => {
    const listEndpoints = await ListsDB.find()

    res.json(listEndpoints)
})


router.post('/', isAuthenticated, async (req, res) => {
    const listEndpoints: ListEndpoint[] = req.body

    try {
        for (const list of listEndpoints) {

            if (!list?.ListID) {
                list.ListID = crypto.randomUUID()
            }

            await ListsDB.findOneAndUpdate({
                ListID: list.ListID
            }, {
                ListID: list.ListID,
                ListName: list.ListName,
                AdminGroups: list.AdminGroups,
                Enabled: list.Enabled,
                AllRolesEnabled: list.AllRolesEnabled,
                UseWhitelistGroup: list.UseWhitelistGroup,
            }, {
                upsert: true,
                runValidators: true
            })
        }
    } catch (err) {
        // defaultLogger.error(err)
        console.error(err)
        res.sendStatus(400)
        return
    }

    res.sendStatus(200)
    await refreshListCache()
})




export default { router: router }
