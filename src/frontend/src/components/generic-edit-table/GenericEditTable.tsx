import React from "react";
import OptionsDropdown, {OptionsItem} from "../dropdowns/OptionsDropdown";

type ColumnDefinition<T> = {
    header: string;
    renderCell: (item: T, index: number) => React.ReactNode;
};

type EditableTableProps<T> = {
    data: T[];
    columns: ColumnDefinition<T>[];
    onSubmit: (e: React.FormEvent) => void;
    onAddItem?: () => void;
    onDeleteItem?: (index: number) => void;
};


export function EditableTable<T>({ data, columns, onSubmit, onAddItem, onDeleteItem }: EditableTableProps<T>) {
    return (
        <form onSubmit={onSubmit}>
            <table>
                <thead>
                <tr>
                    {columns.map((col, idx) => (
                        <th key={idx}>{col.header}</th>
                    ))}
                    {onDeleteItem && <th>Actions</th>}
                </tr>
                </thead>
                <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        {columns.map((col, colIndex) => (
                            <td key={colIndex}>
                                {col.renderCell(item, index)}
                            </td>
                        ))}
                        {onDeleteItem && (
                            <td>
                                <OptionsDropdown>
                                    <OptionsItem></OptionsItem>
                                </OptionsDropdown>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="buttons-wrapper">
                {onAddItem && <button type="button" onClick={onAddItem}>Add Item</button>}
                <button type="submit">Submit</button>
            </div>
        </form>
    );
}
