import {useQuery} from "@tanstack/react-query";
import React, {useState} from "react";
import axios from "axios";
import {InGameAdminPermissions} from "../../../../dist/backend/schema";

axios.defaults.withCredentials = true

function AdminGroups() {
    const { data, isLoading, error } = useQuery({
            queryKey: ['admingroups'],
            queryFn: fetchAdminGroups,
    });

    if (isLoading) return <p>Loading...</p>;
    // if (error) return <p>Error: {error.message}</p>;
    if (error) return <p>Unable to retrieve groups from the server</p>;
    if (!data) return <p>Something went wrong when loading your whitelist data</p>

    return (
    <div className={"admin-group-container"}>
        <h1>ADMIN GROUP MANAGEMENT</h1>
        <AdminGroupForm adminGroups={data}></AdminGroupForm>
    </div>
    )
}


function AdminGroupForm({ adminGroups }: any) {
  const [adminGroupRows, setAdminGroupRows] = useState<AdminGroupRow[]>(
    [...adminGroups]
  );

  // Handle transferring permissions between boxes
  const handlePermissionTransfer = (
    groupIndex: number,
    permission: string,
    toCurrent: boolean
  ) => {
    setAdminGroupRows((prevRows) => {
      const updatedRows = [...prevRows];
      const group = updatedRows[groupIndex];

      if (toCurrent) {
        // Move from available to current
        group.Permissions.push(permission);
      } else {
        // Move from current to available
        group.Permissions = group.Permissions.filter((perm) => perm !== permission);
      }

      return updatedRows;
    });
  };

  return (
    <div>
      <table id="admin-groups-table">
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Group Name</th>
            <th>Active Permissions</th>
            <th>Available Permissions</th>
            <th>Enabled</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {adminGroupRows.map((group: AdminGroupRow, index) => (
            <tr key={group._id || index.toString()}>
              <td>
                <input
                  className="steam-id-input"
                  value={group.GroupName}
                  placeholder="Group Name"
                  onChange={(e) => {
                    const newGroupName = e.target.value;
                    setAdminGroupRows((prev) => {
                      const updated = [...prev];
                      updated[index].GroupName = newGroupName;
                      return updated;
                    });
                  }}
                />
              </td>
              <td>
                <div className="admin-group-container permissions-wrapper current">
                  {group.Permissions.map((permission) => (
                    <button
                      key={permission}
                      title={ALL_POSSIBLE_PERMISSIONS_MAP.get(permission)}
                      onClick={() =>
                        handlePermissionTransfer(index, permission, false)
                      }
                    >
                      {permission}
                    </button>
                  ))}
                </div>
              </td>
              <td>
                <div className="admin-group-container permissions-wrapper available">
                  {Array.from(ALL_POSSIBLE_PERMISSIONS_MAP.keys())
                    .filter((permission) => !group.Permissions.includes(permission))
                    .map((permission) => (
                      <button
                        key={permission}
                        title={ALL_POSSIBLE_PERMISSIONS_MAP.get(permission)}
                        onClick={() =>
                          handlePermissionTransfer(index, permission, true)
                        }
                      >
                        {permission}
                      </button>
                    ))}
                </div>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={group.Enabled}
                  onChange={() => {
                    setAdminGroupRows((prev) => {
                      const updated = [...prev];
                      updated[index].Enabled = !updated[index].Enabled;
                      return updated;
                    });
                  }}
                />
              </td>
              <td>
                <button
                  onClick={() => {
                    setAdminGroupRows((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                >
                  DELETE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function onCurrentPermissionClick(index: number) {

}

function onAvailablePermissionClick(index: number) {

}






function WhitelistGroup() {
    return (
    <tr>
        <td>
            Whitelist
        </td>
    </tr>)
}



async function onGroupsSubmit(event: any) {

}

async function fetchAdminGroups() {
    const res = await axios.get('http://localhost:5000/api/admingroups')

    if (res.status != 200) {
        throw new Error(`Unable to fetch admin group data`)
    }

    return res.data
}


const ALL_POSSIBLE_PERMISSIONS_MAP = new Map([
    ["changemap", "Allows a user to use map commands such as adminSetNextLayer or adminChangeMap."],
    ["canseeadminchat", "Allows a user to *see* the in game admin chat as well as teamkills."],
    ["balance", "Allows a user to switch teams regardless of current balance."],
    ["pause", "Allows a user to pause the game. Does not work on licensed servers."],
    ["cheat", "Allows a user to gain access to some cheat commands. Does not work on licensed servers."],
    ["private", "Allows a user to set a server to private, does not work for licensed servers?"],
    ["chat", "Allows a user to *write* in admin chat, or use server broadcasts."],
    ["kick", "Allows a user to use in game kick commands."],
    ["ban", "Allows a user to use in game ban commands."],
    ["config", "Allows a user to set server configuration. Does not work for licensed servers."],
    ["immune", "Users with this permission cannot be kicked or banned."],
    ["manageserver", "Allows a user to use various management commands, including to kill the server."],
    ["cameraman", "Allows a user to use the in-game spectator camera."],
    ["featuretest", "Allows a user to use debug commands, such as spawning vehicles."],
    ["forceteamchange", "Allows a user to force team swap other players."],
    ["reserve", "Allows a user to use the priority/whitelist queue."],
    ["debug", "Allows a user to use debug commands."],
    ["teamchange", "Allows a user to change teams without penalty."],
])


/**
 * Interface that describes a group of in-game permissions.
 */
export interface IAdminGroup extends Document {
    GroupName: string,
    Permissions: InGameAdminPermissions[],
    Enabled: boolean,
    IsWhitelistGroup: boolean
}


type AdminGroupFormProps = {
    adminGroups: AdminGroupRow[]
}


type AdminGroupRow = {
    _id?: string
    GroupName: string,
    // ActivePermissions: InGameAdminPermissions[]
    Permissions: string[]
    Enabled: boolean,
    IsWhitelistGroup: boolean
}



export default AdminGroups