import React, {ReactNode} from "react";
import './management-table.css'


/**
 * Component that represents a table used for editing data that can be segmented into rows.
 * For this project, that is things like discord roles, admin lists, in-game admin groups.
 * @constructor
 */
function ManagementTable(props: {headerCells: ReactNode, children?: React.ReactNode, onSubmit: () => void}) {
    return (
        <div className={"management-table-wrapper"}>
            <table>
                <thead>
                    <tr className={"management-table-head-row"}>
                        {props.headerCells}
                    </tr>
                </thead>
                <tbody>
                    {props.children}
                </tbody>
            </table>
        </div>)
}


export default ManagementTable;