import React from "react";

/*

 */

function GenericEditTable({tableHead}: any) {
    return (
    <div className={"edit-table-wrapper"}>
        <table>
            <thead className={"edit-table-header"}>
                {tableHead}
            </thead>
            <tbody>

            </tbody>
        </table>
    </div>)
}


interface GenericTableProps {
    tableHead: React.ReactNode
    tableBody: React.ReactNode[][]
}

export default GenericEditTable