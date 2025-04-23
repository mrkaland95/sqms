import * as mongoose from "mongoose";
import {AdminGroupsDB, DiscordUsersDB, InGameAdminPermissions, ListsDB, RolesDB, WeekDays} from "../database";

const connectionString = "mongodb://127.0.0.1:27017/whitelist-v2-throwaway"


/**
 * Manual tests for checking that the correct data is being put into the various schemas.
 */

async function main() {
    await mongoose.connect(connectionString)
    
    await DiscordUsersDB.deleteMany()
    await ListsDB.deleteMany()
    await AdminGroupsDB.deleteMany()
    await RolesDB.deleteMany()


    await initializeTestEntries()

    // await DiscordUsersDB.deleteMany()
    // await ListsDB.deleteMany()
    // await AdminGroupsDB.deleteMany()
    // await RolesDB.deleteMany()



    process.exit()
}


async function initializeTestEntries() {
    const dummyUserID = `12345`
    const dummyDiscordRoleID = '12345'
    const dummyDiscordRoleID2 = '123457'


    const testUser = await DiscordUsersDB.findOneAndUpdate({
        DiscordID: dummyUserID
    }, {
        DiscordID: dummyUserID,
        DiscordName: 'testuser',
        Roles: [dummyDiscordRoleID2, dummyDiscordRoleID],
        Whitelist64IDs: [
            { steamID: 'testid1', name: 'testname' },
            { steamID: 'testid2', name: 'testname2' },
        ],
        Enabled: true,
        UserID64: { steamID: '75343'}
    }, {
        upsert: true, new: true, runValidators: true
    }).exec()


    const testGroup = await AdminGroupsDB.findOneAndUpdate({
        GroupName: "Admins",
    }, {
        GroupName: "Admins",
        Permissions: [
            InGameAdminPermissions.FEATURE_TEST,
            InGameAdminPermissions.CAN_SEE_ADMIN_CHAT,
            InGameAdminPermissions.IMMUNE
        ],
        Enabled: true
    }, {
        upsert: true, new: true, runValidators: true
    }).exec()


    const whitelistGroup = await AdminGroupsDB.findOneAndUpdate({
        GroupName: "Whitelist",
    }, {
        GroupName: "Whitelist",
        Permissions: [InGameAdminPermissions.RESERVE],
        Enabled: true,
        IsWhitelistGroup: true
    }, {
        upsert: true, new: true, runValidators: true
    }).exec()


    const testRole = await RolesDB.findOneAndUpdate({
        RoleID: dummyDiscordRoleID
    }, {
        RoleID: dummyDiscordRoleID,
        RoleName: "TestRole",
        AdminGroup: testGroup,
        WhitelistSlots: 5,
        ActiveDays: [WeekDays.Monday, WeekDays.Tuesday, WeekDays.Thursday],
        Enabled: true
    }, {
        upsert: true, new: true, runValidators: true
    }).exec()


    const testRole2 = await RolesDB.findOneAndUpdate({
        RoleID: dummyDiscordRoleID2
    }, {
        RoleID: dummyDiscordRoleID2,
        RoleName: "TestRole2",
        AdminGroup: whitelistGroup,
        ActiveDays: [WeekDays.Monday, WeekDays.Tuesday, WeekDays.Wednesday, WeekDays.Thursday, WeekDays.Friday, WeekDays.Saturday, WeekDays.Sunday],
        Enabled: true
    }, {
        upsert: true, new: true, runValidators: true
    }).exec()


    const testList = await ListsDB.findOneAndUpdate({
        ListName: 'testlist'
    }, {
        AdminGroups: [testGroup, whitelistGroup],
        AllRolesEnabled: false,
    }, {
        upsert: true, new: true, runValidators: true
    }).exec()


    console.log("Test Group: ", testGroup);
    console.log("Whitelist Group: ", whitelistGroup);
    console.log("Test User: ", testUser)
    console.log("Test Role: ", testRole)
    console.log("Test Role2: ", testRole2)
    console.log("Test List: ", testList)

}


async function initiateRealRoles() {
    await mongoose.connect(connectionString)
    const generalRoleID = "757561984374931466"
    const name = "General"

    // @ts-ignore
    const adminGroup = await AdminGroupsDB.find()[0]

    const result = await RolesDB.findOneAndUpdate({
        RoleID: generalRoleID
    }, {
        RoleID: generalRoleID,
        RoleName: name,
        AdminGroup: adminGroup,
        ActiveDays: [0, 1, 2, 3, 4, 5, 6],
        WhitelistSlots: 5,
        Enabled: true
    }, {
        new: true, upsert: true, runValidators: true
    }).exec()
    process.exit()
}


initiateRealRoles()


// main()
