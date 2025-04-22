import axios from "axios";
import { useQuery } from '@tanstack/react-query';
import React, {useEffect, useState} from "react";
// import {IPrivilegedRole} from "../../../../dist/backend/schema";
import Swal from "sweetalert2";
import {daysMap, steamID64Regex, WeekDays} from "../utils/utils";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {IAdminGroup} from "./AdminGroups";
import {getUsersWhitelist, postAdminGroups, postUserWhitelists} from "../utils/fetch";
import {nanoid} from "nanoid";


function Whitelist() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['whitelist'],
        queryFn: getUsersWhitelist,
    });


    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!data) return <p>Something went wrong when loading your whitelist data</p>

    const activeDaysList = data.whitelistActiveDays.map(day => {
        return daysMap.get(day)
    })

    return (
        <>
        <div className={"whitelist-container"}>
            <h1>
                WHITELIST MANAGEMENT
            </h1>
            <h3 style={{padding: '1rem 0rem'}}>
               This page is used for managing your whitelist slots for other people
            </h3>
            <hr style={{marginBottom: '1rem'}} />
            <div className={"active-days-container"}>
                    <p><em>
                        Some discord roles may only get whitelist on certain days<br/>
                        in your case, they are the following:
                    </em></p>
                {activeDaysList.map((day) => (
                    <p style={{padding: '0.3rem 0rem'}}><b>{day}</b></p>
                ))}
            </div>
            <p style={{paddingBottom: '10px', paddingTop: '10px'}}>
                <em>You currently have {data.whitelistSlots} whitelist slots available<br/></em>
            </p>
            <div className={"whitelist-forms"}>
                <WhiteListForms whitelist={data.whitelistedSteam64IDs} whitelistSlots={data.whitelistSlots}></WhiteListForms>
            </div>
        </div>
    </>
    )
}


function WhiteListForms({ whitelist, whitelistSlots }: WhitelistFormProps) {
    const [whitelistRows, setWhitelistRows] = useState<WhitelistRow[]>([]);

    useEffect(() => {
        let slots: WhitelistRow[] = [];
        for (let i = 0; i < whitelist.length || i < whitelistSlots; i++) {
            let row: WhitelistRow = { steamID: '', name: '', id: nanoid(), whitelistEnabled: true };
            const steamID = whitelist[i]?.steamID;
            const name = whitelist[i]?.name;

            if (steamID) {
                row.steamID = steamID;
                if (name) {
                    row.name = name;
                }
            }
            slots.push(row);
        }
        setWhitelistRows(slots);
    }, [whitelist, whitelistSlots]);

    function handleInputChange(index: number, field: 'steamID' | 'name', value: string) {
        const updatedRows = [...whitelistRows];
        updatedRows[index][field] = value;
        setWhitelistRows(updatedRows);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        onFormSubmit(whitelistRows);
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = whitelistRows.findIndex((row) => row.id === active.id);
            const newIndex = whitelistRows.findIndex((row) => row.id === over.id);

            setWhitelistRows((rows) => arrayMove(rows, oldIndex, newIndex));
        }
    }

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={whitelistRows.map((row) => row.id)}>
                <form onSubmit={handleSubmit}>
                    {whitelistRows.map((row, index) => (
                        <SortableRow
                            key={row.id}
                            id={row.id}
                            row={row}
                            index={index}
                            onInputChange={handleInputChange}
                        />
                    ))}
                    <div className={"whitelist-container button-wrapper"}>
                        <button
                            type={"submit"}
                            style={{ marginTop: '20px' }}
                            className={"default-button"}
                            title={"Submit your steamIDs to our systems"}
                        >
                            Submit
                        </button>
                        <button
                            type={"button"}
                            style={{ marginTop: '20px' }}
                            className={"default-button"}
                            title={"Validate IDs"}
                        >
                            Validate IDs
                        </button>
                    </div>
                </form>
            </SortableContext>
        </DndContext>
    );
}


function SortableRow({ id, row, index, onInputChange }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            className={"whitelist-container row-box"}
            style={{ ...style }}
            {...attributes}
        >
            <span {...listeners} style={{ cursor: 'grab', marginRight: '10px' }}>
                ☰
            </span>
            <input
                type="text"
                inputMode={"numeric"}
                pattern={"[0-9]+"}
                value={row.steamID}
                onChange={(e) => onInputChange(index, 'steamID', e.target.value)}
                placeholder={"Enter SteamID"}
                maxLength={17}
                className={"steam-id-input"}
            />
            <input
                type="text"
                value={row.name}
                onChange={(e) => onInputChange(index, 'name', e.target.value)}
                placeholder="Enter Optional Name"
                maxLength={50}
                className={"steam-id-input"}
            />
        </div>
    );
}

//
//     // TODO this wills end a post request to the server with the steamID, which will then send an API request to steam to see if the steamID is valid.
// function validateSteamID(steamID: string, whitelistRows: WhitelistRow[]) {
//     const result = steamID64Regex.test(steamID)
//     console.log("Validate triggered for ID: ", steamID, "result: ", result)
//     // TODO add some sort of feedback if the steamID does not pass the regex validation.
//     // if (!result) return;
//
//
//     console.log(whitelistRows)
//
//     const postRes = axios({
//         method: "POST",
//         url: "http://localhost:5000/api/profile/validateid",
//         data: {steamID: steamID},
//         withCredentials: true
//     })
// }



function validateSteamIDs(whitelistRows: WhitelistRow[]) {
    // const result = steamID64Regex.test(steamID)
    // console.log("Validate triggered for ID: ", steamID, "result: ", result)
    // if (!result) return;

    // TODO add some sort of feedback if the steamID does not pass the regex validation.
    for (const row of whitelistRows) {
        if (steamID64Regex.test(row.steamID)) {
            console.log("Invalid steamID detected.")
        }
    }
    console.log(whitelistRows)


}



async function onFormSubmit(data: WhitelistRow[]) {
  // let buttonRes = await Swal.fire({
  //           title: "Are you sure you wish to delete this role?",
  //           text: "These changes are permanent",
  //           showCancelButton: true,
  //           confirmButtonColor: "#9d0d0d",
  //           cancelButtonColor: "#1939b7",
  //           background: "FFF",
  //           confirmButtonText: "SUBMIT",
  //       })
  //



    data = data.filter(row => {
        return row?.steamID;
    })

    const res = await postUserWhitelists(data)

    if (res.status == 200 && res.data.success) {
        await Swal.fire("Sucessfully installed IDs", "", "success")
    } else {
        // TODO add modal here
        console.log("Something went wrong when sending steamIDs")
    }
}


export type WhitelistResponseData = {
    isAuthenticated: boolean,
    validRoles: IPrivilegedRole[],
    whitelistSlots: number,
    whitelistActiveDays: number[],
    whitelistedSteam64IDs: {
        steamID:string
        name?: string,
    }[],
}

export interface IPrivilegedRole {
    RoleID: string,
    RoleName: string,
    AdminGroup?: IAdminGroup,
    ActiveDays: [WeekDays],
    WhitelistSlots: number
    Enabled: boolean
}



type WhitelistFormProps = {
    whitelist: Whitelist[]
    whitelistSlots: number,
}


export type Whitelist = {
    steamID: string
    name?: string
}


export type WhitelistRow = Whitelist & {
    id: string;
    whitelistEnabled: boolean
}


export default Whitelist