import React from "react";

interface ColumnConfig<T> {
    header: string;
    field: keyof T;
    editable?: boolean;
    renderEdit?: (value: any, onChange: (newValue: any) => void, rowIndex: number) => React.ReactNode;
}

interface EditableDataGridProps<T> {
    data: T[];
    onDataChange: (newData: T[]) => void;
    columns: ColumnConfig<T>[];
}

export function EditableDataGrid<T extends object>({ data, onDataChange, columns }: EditableDataGridProps<T>) {
    const handleCellChange = (rowIndex: number, field: keyof T, newValue: any) => {
        const updated = [...data];
        (updated[rowIndex][field] as any) = newValue;
        onDataChange(updated);
    };

    return (
        <table>
            <thead>
            <tr>
                {columns.map((col, idx) => (
                    <th key={idx}>{col.header}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                        <td key={colIndex}>
                            {col.editable && col.renderEdit ? (
                                col.renderEdit(row[col.field], (newValue) => handleCellChange(rowIndex, col.field, newValue), rowIndex)
                            ) : (
                                String(row[col.field])
                            )}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}
